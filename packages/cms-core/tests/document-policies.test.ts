/**
 * The reject-only policy seam: `beforePublish`, `beforeUnpublish` and
 * `beforeDelete` on a schema or on `CMSConfig.policies` run inside
 * CollectionAPI, so every path (Local API, REST, GraphQL, MCP, jobs) obeys
 * them, and a schema `lock` holds on the server: an update that changes a
 * locked field, or a delete of a locked document, is refused.
 *
 * Lives in tests/ (not src/) so the package build never compiles it into dist.
 * Run: pnpm -F @aphexcms/cms-core test
 */
import { describe, expect, it, vi } from 'vitest';
import { DocumentPolicyError } from '../src/lib/local-api/policies';
import { createAphexApi } from '../src/lib/server/api/index';
import { documentsByIdRouter } from '../src/lib/server/api/routes/documents-by-id';
import type { CMSInstances } from '../src/lib/hooks';
import type { Auth } from '../src/lib/types/auth';
import type { DocumentPolicyContext, SchemaType } from '../src/lib/types/schemas';
import { fakeCollection, fakeStore, systemCtx } from './helpers/fake-collection';

const page: SchemaType = {
	type: 'document',
	name: 'page',
	title: 'Page',
	fields: [
		{ name: 'title', type: 'string', title: 'Title' },
		{ name: 'slug', type: 'string', title: 'Slug' }
	],
	policies: {
		beforePublish: [
			({ data }) => (data.slug === '/taken' ? 'Another page already serves /taken' : undefined)
		],
		beforeUnpublish: [
			({ data }) => (data.slug === '/' ? 'The home page stays published' : undefined)
		],
		beforeDelete: [({ publishedData }) => (publishedData ? 'Unpublish it first' : undefined)]
	},
	lock: (_id, document) => {
		const doc = document as { slug?: string; _meta?: { status?: string } } | null;
		return doc?.slug === '/' && doc._meta?.status === 'published'
			? { reason: 'The home page address is fixed', fields: ['slug'] }
			: null;
	}
};

describe('document policies', () => {
	it('refuses a publish the schema policy rejects, on create and on publish', async () => {
		const pages = fakeCollection(page, fakeStore());
		await expect(
			pages.create(systemCtx, { title: 'T', slug: '/taken' }, { publish: true })
		).rejects.toThrow(DocumentPolicyError);

		const created = await pages.create(systemCtx, { title: 'T', slug: '/taken' });
		const err = await pages.publish(systemCtx, created.document.id).catch((e) => e);
		expect(err).toBeInstanceOf(DocumentPolicyError);
		expect(err.operation).toBe('publish');
		expect(err.message).toBe('Another page already serves /taken');

		await expect(
			pages.update(systemCtx, created.document.id, { slug: '/free' }, { publish: true })
		).resolves.toBeTruthy();
	});

	it('refuses an unpublish and a delete the schema policies reject', async () => {
		const store = fakeStore();
		const pages = fakeCollection(page, store);
		const home = await pages.create(systemCtx, { title: 'Home', slug: '/' }, { publish: true });
		await expect(pages.unpublish(systemCtx, home.document.id)).rejects.toThrow(
			'The home page stays published'
		);
		await expect(pages.delete(systemCtx, home.document.id)).rejects.toThrow(DocumentPolicyError);
		expect(store.docs.has(home.document.id)).toBe(true);
		expect(store.events.map((e) => e.type)).toEqual(['document.created', 'document.published']);
	});

	it('runs the config policies first, for every type, with the policy context', async () => {
		const seen: DocumentPolicyContext[] = [];
		const configPolicy = vi.fn((ctx: DocumentPolicyContext) => {
			seen.push(ctx);
			return ctx.data.title === 'nope' ? 'Refused by the app' : undefined;
		});
		const pages = fakeCollection(page, fakeStore(), {
			policies: { beforePublish: [configPolicy] }
		});
		const created = await pages.create(systemCtx, { title: 'nope', slug: '/x' });
		await expect(pages.publish(systemCtx, created.document.id)).rejects.toThrow(
			'Refused by the app'
		);
		expect(seen[0]).toMatchObject({
			operation: 'publish',
			documentId: created.document.id,
			data: { title: 'nope', slug: '/x' },
			publishedData: null,
			context: { organizationId: 'org-1', userId: 'user-1' },
			schema: { name: 'page' }
		});
	});

	it('enforces the schema lock on update and delete, for any caller', async () => {
		const store = fakeStore();
		const pages = fakeCollection(page, store);
		const home = await pages.create(systemCtx, { title: 'Home', slug: '/' }, { publish: true });
		const id = home.document.id;

		const err = await pages.update(systemCtx, id, { slug: '/moved' }).catch((e) => e);
		expect(err).toBeInstanceOf(DocumentPolicyError);
		expect(err.operation).toBe('update');
		expect(err.lockedFields).toEqual(['slug']);
		expect(err.message).toContain('The home page address is fixed');
		expect(store.docs.get(id)!.draftData).toMatchObject({ slug: '/' });

		// Other fields stay editable, and an unchanged locked field is no change.
		await expect(
			pages.update(systemCtx, id, { title: 'Welcome', slug: '/' })
		).resolves.toBeTruthy();

		await expect(pages.delete(systemCtx, id)).rejects.toThrow('Cannot delete a locked document');
	});
});

describe('policy refusals over REST', () => {
	const sessionAuth = {
		type: 'session',
		organizationId: 'org-1',
		user: { id: 'user-1', email: 'a@b.com', name: 'A' }
	} as unknown as Auth;

	function cms(error: Error) {
		return {
			localAPI: {
				findDocumentById: vi.fn().mockResolvedValue({ id: 'doc-1', type: 'page' }),
				getCollection: () => ({
					update: vi.fn().mockRejectedValue(error),
					delete: vi.fn().mockRejectedValue(error)
				})
			}
		} as unknown as CMSInstances;
	}

	it('answers 409 with the operation and the locked fields', async () => {
		const app = createAphexApi();
		app.route('/documents', documentsByIdRouter);
		const error = new DocumentPolicyError('update', 'Cannot change locked field(s) "slug"', [
			'slug'
		]);
		const res = await app.fetch(
			new Request('http://localhost/api/documents/doc-1', {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ draftData: { slug: '/moved' } })
			}),
			{ aphexCMS: cms(error), auth: sessionAuth }
		);
		expect(res.status).toBe(409);
		expect(await res.json()).toMatchObject({
			success: false,
			error: 'Refused by policy',
			operation: 'update',
			lockedFields: ['slug']
		});

		const del = await app.fetch(
			new Request('http://localhost/api/documents/doc-1', { method: 'DELETE' }),
			{ aphexCMS: cms(new DocumentPolicyError('delete', 'Unpublish it first')), auth: sessionAuth }
		);
		expect(del.status).toBe(409);
	});
});

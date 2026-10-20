/**
 * The reject-only policy seam: `beforeWrite`, `beforePublish`,
 * `beforeUnpublish` and `beforeDelete` on a schema or on `CMSConfig.policies` run inside
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
import type { LocalAPIContext } from '../src/lib/local-api/types';
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

	it('hands a policy the adapter, so it can judge the document against the others', async () => {
		const store = fakeStore();
		const pages = fakeCollection(
			{
				...page,
				policies: {
					beforePublish: [
						async ({ data, documentId, databaseAdapter, context }) => {
							const holder = await databaseAdapter.findByDocIdAdvanced(
								context.organizationId,
								'doc-1'
							);
							return holder && holder.id !== documentId && holder.draftData?.slug === data.slug
								? `"${data.slug}" is already served`
								: undefined;
						}
					]
				}
			},
			store
		);
		const first = await pages.create(systemCtx, { title: 'A', slug: '/about' });
		expect(first.document.id).toBe('doc-1');
		await expect(pages.publish(systemCtx, first.document.id)).resolves.toBeTruthy();

		const second = await pages.create(systemCtx, { title: 'B', slug: '/about' });
		await expect(pages.publish(systemCtx, second.document.id)).rejects.toThrow(
			'"/about" is already served'
		);
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

describe('beforeWrite policies', () => {
	const session = (organizationRole: string, role = 'editor'): LocalAPIContext => ({
		organizationId: 'org-1',
		user: { id: 'user-2', email: 'c@d.com', name: 'C' } as LocalAPIContext['user'],
		auth: {
			type: 'session',
			organizationId: 'org-1',
			organizationRole,
			user: { id: 'user-2', email: 'c@d.com', name: 'C', role }
		} as unknown as Auth
	});

	// Only an owner may change `embed`; anyone may change the rest.
	const ownersOnly = ({ data, previousData, context }: DocumentPolicyContext) =>
		!context.system && context.role !== 'owner' && data.embed !== (previousData?.embed ?? undefined)
			? 'Only an owner may change the embed'
			: undefined;
	const withEmbed: SchemaType = {
		...page,
		fields: [...page.fields, { name: 'embed', type: 'string', title: 'Embed' }],
		policies: { beforeWrite: [ownersOnly] }
	};

	it('hands the policy the writer, the stored draft and the draft to store', async () => {
		const seen: DocumentPolicyContext[] = [];
		const pages = fakeCollection(
			{ ...withEmbed, policies: { beforeWrite: [(ctx) => void seen.push(ctx)] } },
			fakeStore()
		);
		const created = await pages.create(session('admin'), { title: 'A', slug: '/a' });
		await pages.update(session('owner'), created.document.id, { title: 'B' });
		await pages.update(systemCtx, created.document.id, { title: 'C' });
		expect(seen.map((ctx) => [ctx.operation, ctx.context.role, ctx.context.system])).toEqual([
			['create', 'admin', undefined],
			['update', 'owner', undefined],
			['update', undefined, true]
		]);
		expect(seen[0].previousData).toBeNull();
		expect(seen[1]).toMatchObject({ previousData: { title: 'A' }, data: { title: 'B' } });
	});

	it('reads an instance role as owner', async () => {
		const pages = fakeCollection(withEmbed, fakeStore());
		await expect(
			pages.create(session('admin', 'super_admin'), { title: 'A', slug: '/a', embed: '<b>' })
		).resolves.toBeTruthy();
	});

	it('refuses a create and an update the writer may not make, and stores nothing', async () => {
		const store = fakeStore();
		const pages = fakeCollection(withEmbed, store);
		const err = await pages
			.create(session('admin'), { title: 'A', slug: '/a', embed: '<b>' })
			.catch((e) => e);
		expect(err).toBeInstanceOf(DocumentPolicyError);
		expect(err.operation).toBe('create');
		expect(store.docs.size).toBe(0);

		const created = await pages.create(session('owner'), { title: 'A', slug: '/a', embed: '<b>' });
		const id = created.document.id;
		await expect(pages.update(session('admin'), id, { embed: '<i>' })).rejects.toThrow(
			'Only an owner may change the embed'
		);
		expect(store.docs.get(id)!.draftData).toMatchObject({ embed: '<b>' });
		// Leaving the guarded field as it is stays allowed.
		await expect(pages.update(session('admin'), id, { title: 'B' })).resolves.toBeTruthy();
	});

	it('refuses restoring a version the writer could not have saved', async () => {
		const store = fakeStore();
		const versions = new Map<number, Record<string, unknown>>();
		Object.assign(store.adapter, {
			async getDocumentVersion(_org: string, _id: string, n: number) {
				return versions.has(n) ? { data: versions.get(n) } : null;
			}
		});
		const pages = fakeCollection(withEmbed, store);
		const created = await pages.create(session('owner'), { title: 'A', slug: '/a', embed: '<b>' });
		versions.set(1, { title: 'A', slug: '/a', embed: '<script>' });
		versions.set(2, { title: 'Old', slug: '/a', embed: '<b>' });

		await expect(pages.assertRestorable(session('admin'), created.document.id, 1)).rejects.toThrow(
			DocumentPolicyError
		);
		await expect(
			pages.assertRestorable(session('admin'), created.document.id, 2)
		).resolves.toBeUndefined();
		await expect(
			pages.assertRestorable(session('owner'), created.document.id, 1)
		).resolves.toBeUndefined();
	});

	it('refuses restoring a version that changes a locked field', async () => {
		const store = fakeStore();
		Object.assign(store.adapter, {
			async getDocumentVersion() {
				return { data: { title: 'Home', slug: '/old-home' } };
			}
		});
		const pages = fakeCollection(page, store);
		const home = await pages.create(systemCtx, { title: 'Home', slug: '/' }, { publish: true });
		await expect(pages.assertRestorable(systemCtx, home.document.id, 1)).rejects.toThrow(
			'The home page address is fixed'
		);
	});
});

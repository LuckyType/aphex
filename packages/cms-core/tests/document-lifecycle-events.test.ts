/**
 * Every document write appends its lifecycle fact on the transaction handle it
 * writes with: `document.created`, `document.draft_saved`, `document.unpublished`
 * and `document.deleted` beside the existing `document.published`. A consumer
 * (an audit trail, a cache) therefore sees every change, never one that rolled
 * back, and never misses a draft that was never published.
 *
 * Lives in tests/ (not src/) so the package build never compiles it into dist.
 * Run: pnpm -F @aphexcms/cms-core test
 */
import { describe, expect, it } from 'vitest';
import type { SchemaType } from '../src/lib/types/schemas';
import { fakeCollection, fakeStore, systemCtx } from './helpers/fake-collection';

const post: SchemaType = {
	type: 'document',
	name: 'post',
	title: 'Post',
	fields: [{ name: 'title', type: 'string', title: 'Title' }]
};

describe('document lifecycle events', () => {
	it('records created, draft_saved, published, unpublished and deleted in order', async () => {
		const store = fakeStore();
		const posts = fakeCollection(post, store);

		const created = await posts.create(systemCtx, { title: 'Hello' });
		const id = created.document.id;
		await posts.update(systemCtx, id, { title: 'Hello again' });
		await posts.publish(systemCtx, id);
		await posts.unpublish(systemCtx, id);
		await posts.delete(systemCtx, id);

		expect(store.events.map((e) => e.type)).toEqual([
			'document.created',
			'document.draft_saved',
			'document.published',
			'document.unpublished',
			'document.deleted'
		]);
		for (const event of store.events) {
			expect(event.organizationId).toBe('org-1');
			expect(event.createdBy).toBe('user-1');
			expect(event.payload).toMatchObject({ documentId: id, documentType: 'post' });
		}
		expect(store.events[1]!.payload).toMatchObject({ revision: 2 });
	});

	it('emits created before published when a create publishes at once', async () => {
		const store = fakeStore();
		const posts = fakeCollection(post, store);
		await posts.create(systemCtx, { title: 'Hello' }, { publish: true });
		expect(store.events.map((e) => e.type)).toEqual(['document.created', 'document.published']);
	});

	it('attributes a write to the context actor when it has no user', async () => {
		const store = fakeStore();
		const posts = fakeCollection(post, store);
		const created = await posts.create(
			{ organizationId: 'org-1', overrideAccess: true, actorId: 'scheduler-1' },
			{ title: 'Hello' }
		);
		await posts.delete({ organizationId: 'org-1', overrideAccess: true }, created.document.id);
		expect(store.events[0]!.createdBy).toBe('scheduler-1');
		expect(store.events[1]!.type).toBe('document.deleted');
	});
});

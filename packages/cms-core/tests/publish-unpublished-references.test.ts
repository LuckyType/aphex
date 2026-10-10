/**
 * `POST /api/documents/:id/publish` answers 409 with the blocking references
 * when the draft points at a document that is not published. Before this the
 * guard threw a plain Error and the route answered 500 for the caller's own
 * conflict.
 *
 * Lives in tests/ (not src/) so the package build never compiles it into dist.
 * Run: pnpm -F @aphexcms/cms-core test
 */
import { describe, it, expect, vi } from 'vitest';
import { createAphexApi } from '../src/lib/server/api/index';
import { documentsPublishRouter } from '../src/lib/server/api/routes/documents-publish';
import { UnpublishedReferenceError } from '../src/lib/local-api/collection-api';
import type { CMSInstances } from '../src/lib/hooks';
import type { Auth } from '../src/lib/types/auth';

const blockers = [{ id: 'cat-1', type: 'category', title: 'Starters' }];

function fakeCMS() {
	return {
		localAPI: {
			findDocumentById: vi.fn().mockResolvedValue({ id: 'doc-1', type: 'product' }),
			getCollection: () => ({
				publish: vi.fn().mockRejectedValue(new UnpublishedReferenceError(blockers))
			})
		}
	} as unknown as CMSInstances;
}

const sessionAuth = {
	type: 'session',
	organizationId: 'org-1',
	user: { id: 'user-1', email: 'a@b.com', name: 'A' }
} as unknown as Auth;

describe('publish with unpublished references', () => {
	it('names the blockers in the error', () => {
		const error = new UnpublishedReferenceError(blockers);
		expect(error.message).toContain('1 referenced document(s) are not published');
		expect(error.message).toContain('"Starters" (category)');
		expect(error.references).toEqual(blockers);
	});

	it('answers 409 with the references, not 500', async () => {
		const app = createAphexApi();
		app.route('/documents', documentsPublishRouter);
		const res = await app.fetch(
			new Request('http://localhost/api/documents/doc-1/publish', { method: 'POST' }),
			{ aphexCMS: fakeCMS(), auth: sessionAuth }
		);
		expect(res.status).toBe(409);
		const body = await res.json();
		expect(body).toMatchObject({
			success: false,
			error: 'Unpublished references',
			references: blockers
		});
	});
});

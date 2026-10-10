/**
 * `PATCH /api/user` and `PATCH /api/user/cms-preference` check the session
 * before they validate the body. Before this, an anonymous caller who sent no
 * body (or a malformed one) got 400 from the body validator and the session
 * check in the handler never ran.
 *
 * Lives in tests/ (not src/) so the package build never compiles it into dist.
 * Run: pnpm -F @aphexcms/cms-core test
 */
import { describe, it, expect, vi } from 'vitest';
import { createAphexApi } from '../src/lib/server/api/index';
import { userRouter } from '../src/lib/server/api/routes/user';
import { userPreferencesRouter } from '../src/lib/server/api/routes/user-preferences';
import type { CMSInstances } from '../src/lib/hooks';
import type { Auth } from '../src/lib/types/auth';

function buildApp() {
	const app = createAphexApi();
	app.route('/user', userPreferencesRouter);
	app.route('/user', userRouter);
	return app;
}

function patch(path: string, body: string | null) {
	return new Request(`http://localhost/api${path}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body
	});
}

const sessionAuth = {
	type: 'session',
	organizationId: 'org-1',
	user: { id: 'user-1', email: 'a@b.com', name: 'A' }
} as unknown as Auth;

describe('PATCH /api/user: session before body', () => {
	it('answers 401, not 400, to an anonymous caller with no body', async () => {
		const res = await buildApp().fetch(patch('/user', null), {
			aphexCMS: {} as CMSInstances,
			auth: null
		});
		expect(res.status).toBe(401);
	});

	it('answers 401, not 400, to an anonymous caller with a malformed body', async () => {
		const res = await buildApp().fetch(patch('/user', '{"nope": 1}'), {
			aphexCMS: {} as CMSInstances,
			auth: null
		});
		expect(res.status).toBe(401);
	});

	it('still validates the body for a signed-in caller', async () => {
		const res = await buildApp().fetch(patch('/user', '{"nope": 1}'), {
			aphexCMS: { auth: {} } as unknown as CMSInstances,
			auth: sessionAuth
		});
		expect(res.status).toBe(400);
	});
});

describe('PATCH /api/user/cms-preference: session before body', () => {
	it('answers 401 to an anonymous caller with no body', async () => {
		const res = await buildApp().fetch(patch('/user/cms-preference', null), {
			aphexCMS: { databaseAdapter: { updateUserPreferences: vi.fn() } } as unknown as CMSInstances,
			auth: null
		});
		expect(res.status).toBe(401);
	});
});

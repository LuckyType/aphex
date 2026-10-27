/**
 * The unauthenticated password reset request is throttled per client address.
 * The address is the host's own reading (`clientAddress` in the Hono env,
 * SvelteKit's `getClientAddress`), so a caller cannot mint a fresh bucket per
 * request by sending a different `X-Forwarded-For` each time.
 *
 * Lives in tests/ (not src/) so the package build never compiles it into dist.
 */
import { describe, it, expect, vi } from 'vitest';
import { createAphexApi } from '../src/lib/server/api/index';
import { userRouter } from '../src/lib/server/api/routes/user';
import type { CMSInstances } from '../src/lib/hooks';

function buildApp() {
	const app = createAphexApi();
	app.route('/user', userRouter);
	return app;
}

function resetRequest(email: string, forwardedFor: string) {
	return new Request('http://localhost/api/user/request-password-reset', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': forwardedFor },
		body: JSON.stringify({ email })
	});
}

describe('POST /api/user/request-password-reset: address bucket', () => {
	it('keys on the host-resolved address, not on a rotating X-Forwarded-For', async () => {
		const app = buildApp();
		const requestPasswordReset = vi.fn();
		const env = {
			aphexCMS: { auth: { requestPasswordReset } } as unknown as CMSInstances,
			auth: null,
			clientAddress: '203.0.113.7'
		};

		const statuses: number[] = [];
		for (let i = 0; i < 6; i++) {
			const res = await app.fetch(resetRequest(`person${i}@example.com`, `198.51.100.${i}`), env);
			statuses.push(res.status);
		}

		expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
		expect(requestPasswordReset).toHaveBeenCalledTimes(5);
	});
});

import { createMiddleware } from 'hono/factory';
import type { AphexEnv } from './index';

/**
 * Refuses a request with 401 unless a session is authenticated, before any
 * body validation runs. A route that validates its body first answers 400
 * to an anonymous caller who sent no body, which both leaks whether the
 * route exists and hides the real problem (no session) behind a shape error.
 * Routes whose handler also checks `c.var.auth` keep that check: this only
 * guarantees the order.
 */
export const requireSessionAuth = createMiddleware<AphexEnv>(async (c, next) => {
	const auth = c.var.auth;
	if (!auth || auth.type !== 'session') {
		return c.json(
			{ success: false, error: 'Unauthorized', message: 'Session authentication required' },
			401
		);
	}
	await next();
});

/**
 * Every answer of the MCP route is for one authenticated caller and reflects
 * the content as it is now, so it carries `cache-control: no-store` whatever
 * the transport answered.
 *
 * Lives in tests/ (not src/) so the package build never compiles it into dist.
 * Run: pnpm -F @aphexcms/cms-core test
 */
import { describe, it, expect } from 'vitest';
import { GET } from '../src/lib/routes/mcp';
import type { RequestEvent } from '@sveltejs/kit';

describe('MCP route caching', () => {
	it('marks a response no-store', async () => {
		const request = new Request('http://localhost/mcp', { method: 'GET' });
		const locals = { aphexCMS: { config: {}, databaseAdapter: {} } } as unknown as App.Locals;
		const response = await GET({ request, locals } as unknown as RequestEvent);
		expect(response.status).toBe(401);
		expect(response.headers.get('cache-control')).toBe('no-store');
	});
});

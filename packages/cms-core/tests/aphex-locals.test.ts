/**
 * `aphexLocals` keeps cms-core's `Auth` beside another library's session
 * getter on `locals.auth` instead of overwriting it, and reads cms-core's
 * value back from wherever it was stored.
 *
 * Lives in tests/ (not src/) so the package build never compiles it into dist.
 * Run: pnpm -F @aphexcms/cms-core test
 */
import { describe, it, expect } from 'vitest';
import { aphexLocals } from '../src/lib/auth/locals';
import type { Auth } from '../src/lib/types/index';

const auth = { type: 'session', organizationId: 'org-1' } as unknown as Auth;

describe('aphexLocals', () => {
	it('uses locals.auth when nothing else owns it', () => {
		const locals = {} as App.Locals;
		aphexLocals(locals).auth = auth;
		expect((locals as unknown as { auth: unknown }).auth).toBe(auth);
		expect(aphexLocals(locals).auth).toBe(auth);
	});

	it("leaves another library's getter on locals.auth untouched", () => {
		const getter = () => Promise.resolve(null);
		const locals = { auth: getter } as unknown as App.Locals;
		expect(aphexLocals(locals).auth).toBeUndefined();
		aphexLocals(locals).auth = auth;
		expect((locals as unknown as { auth: unknown }).auth).toBe(getter);
		expect((locals as unknown as { aphexAuth: unknown }).aphexAuth).toBe(auth);
		expect(aphexLocals(locals).auth).toBe(auth);
	});
});

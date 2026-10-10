/**
 * The Studio's sign-in gate covers `/admin` and the paths under it, with a
 * segment boundary: an app's own `/administration` route is not the Studio.
 *
 * Lives in tests/ (not src/) so the package build never compiles it into dist.
 * Run: pnpm -F @aphexcms/cms-core test
 */
import { describe, it, expect } from 'vitest';
import { isAdminPath } from '../src/lib/auth/auth-hooks';

describe('isAdminPath', () => {
	it('matches the Studio root and everything under it', () => {
		expect(isAdminPath('/admin')).toBe(true);
		expect(isAdminPath('/admin/')).toBe(true);
		expect(isAdminPath('/admin/documents/page')).toBe(true);
	});

	it('leaves an app route that merely starts with the word alone', () => {
		expect(isAdminPath('/administration')).toBe(false);
		expect(isAdminPath('/adminx/login')).toBe(false);
		expect(isAdminPath('/')).toBe(false);
	});
});

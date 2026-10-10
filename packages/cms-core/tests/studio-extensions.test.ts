/**
 * The Studio hooks that take a value or a function: the inline script nonce is
 * read per render so an app can hand out the current response's nonce, and
 * the sidebar's groups follow the app's `groupOrder`.
 *
 * Lives in tests/ (not src/) so the package build never compiles it into dist.
 * Run: pnpm -F @aphexcms/cms-core test
 */
import { afterEach, describe, expect, it } from 'vitest';
import { configureStudio, orderedGroups, studioScriptNonce } from '../src/lib/studio-extensions';

afterEach(() => configureStudio({}));

describe('studioScriptNonce', () => {
	it('is undefined when the app set none', () => {
		expect(studioScriptNonce()).toBeUndefined();
	});

	it('returns a fixed string as given', () => {
		configureStudio({ scriptNonce: 'abc' });
		expect(studioScriptNonce()).toBe('abc');
	});

	it('calls a function on every render', () => {
		let n = 0;
		configureStudio({ scriptNonce: () => `nonce-${++n}` });
		expect(studioScriptNonce()).toBe('nonce-1');
		expect(studioScriptNonce()).toBe('nonce-2');
	});
});

describe('orderedGroups', () => {
	const groups = [{ name: null }, { name: 'Content' }, { name: 'Settings' }, { name: 'Shop' }];

	it('keeps first-seen order without a groupOrder', () => {
		expect(orderedGroups(groups, undefined).map((g) => g.name)).toEqual([
			null,
			'Content',
			'Settings',
			'Shop'
		]);
	});

	it('puts named groups in the given order, ungrouped first, the rest after', () => {
		expect(orderedGroups(groups, ['Shop', 'Content']).map((g) => g.name)).toEqual([
			null,
			'Shop',
			'Content',
			'Settings'
		]);
	});
});

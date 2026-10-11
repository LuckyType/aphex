/**
 * The Studio's preview URL bar shows the page's address, not the internal
 * `?aphex-preview` marker the iframe loads with.
 *
 * Lives in tests/ (not src/) so the package build never compiles it into dist.
 * Run: pnpm -F @aphexcms/cms-core test
 */
import { describe, it, expect } from 'vitest';
import { displayPreviewUrl } from '../src/lib/preview/address';

describe('displayPreviewUrl', () => {
	it('drops the marker from the home address', () => {
		expect(displayPreviewUrl('https://example.com/?aphex-preview=1')).toBe('https://example.com/');
	});

	it('drops a bare marker and keeps other params and the hash', () => {
		expect(displayPreviewUrl('https://example.com/blog/x?aphex-preview&tab=2#top')).toBe(
			'https://example.com/blog/x?tab=2#top'
		);
	});

	it('leaves an address without the marker untouched', () => {
		expect(displayPreviewUrl('https://example.com/blog/x?tab=2')).toBe(
			'https://example.com/blog/x?tab=2'
		);
	});

	it('returns a value it cannot parse as is', () => {
		expect(displayPreviewUrl('/blog/x?aphex-preview=1')).toBe('/blog/x?aphex-preview=1');
	});
});

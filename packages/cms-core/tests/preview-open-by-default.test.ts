import { describe, expect, it } from 'vitest';
import { opensPreviewByDefault, PRESENT_MIN_WIDTH } from '../src/lib/preview/open-by-default';

describe('opensPreviewByDefault', () => {
	const wide = PRESENT_MIN_WIDTH;

	it('opens for a schema that asks for it and has a preview URL', () => {
		expect(opensPreviewByDefault({ previewUrl: '/', previewOpenByDefault: true }, wide)).toBe(true);
		expect(opensPreviewByDefault({ previewUrl: () => '/', previewOpenByDefault: true }, wide)).toBe(
			true
		);
	});

	it('stays closed unless the schema asks for it', () => {
		expect(opensPreviewByDefault({ previewUrl: '/' }, wide)).toBe(false);
		expect(opensPreviewByDefault({ previewUrl: '/', previewOpenByDefault: false }, wide)).toBe(
			false
		);
		expect(opensPreviewByDefault(undefined, wide)).toBe(false);
	});

	it('stays closed without a preview URL', () => {
		expect(opensPreviewByDefault({ previewOpenByDefault: true }, wide)).toBe(false);
	});

	it('stays closed below the width that shows the Present button', () => {
		expect(opensPreviewByDefault({ previewUrl: '/', previewOpenByDefault: true }, wide - 1)).toBe(
			false
		);
	});
});

import { describe, expect, it } from 'vitest';
import {
	opensPreview,
	opensPreviewByDefault,
	PRESENT_MIN_WIDTH,
	rememberPreview,
	rememberedPreview
} from '../src/lib/preview/open-by-default';

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

describe('remembered preview choice', () => {
	function memoryStorage(): Storage {
		const items = new Map<string, string>();
		return {
			getItem: (key: string) => items.get(key) ?? null,
			setItem: (key: string, value: string) => void items.set(key, value)
		} as Storage;
	}
	const wide = PRESENT_MIN_WIDTH;

	it('keeps one choice per document type', () => {
		const storage = memoryStorage();
		expect(rememberedPreview('page', storage)).toBeNull();
		rememberPreview('page', true, storage);
		rememberPreview('footer', false, storage);
		expect(rememberedPreview('page', storage)).toBe(true);
		expect(rememberedPreview('footer', storage)).toBe(false);
		rememberPreview('page', false, storage);
		expect(rememberedPreview('page', storage)).toBe(false);
	});

	it('reads blocked or broken storage as no choice', () => {
		const broken = {
			getItem: () => {
				throw new Error('blocked');
			},
			setItem: () => {
				throw new Error('blocked');
			}
		} as unknown as Storage;
		expect(rememberedPreview('page', broken)).toBeNull();
		expect(() => rememberPreview('page', true, broken)).not.toThrow();
		const garbage = { getItem: () => 'not json' } as unknown as Storage;
		expect(rememberedPreview('page', garbage)).toBeNull();
	});

	it('lets the choice win over previewOpenByDefault, within what the window allows', () => {
		const schema = { previewUrl: '/', previewOpenByDefault: true };
		expect(opensPreview(schema, wide, null)).toBe(true);
		expect(opensPreview(schema, wide, false)).toBe(false);
		expect(opensPreview({ previewUrl: '/' }, wide, true)).toBe(true);
		expect(opensPreview({ previewUrl: '/' }, wide - 1, true)).toBe(false);
		expect(opensPreview({}, wide, true)).toBe(false);
	});
});

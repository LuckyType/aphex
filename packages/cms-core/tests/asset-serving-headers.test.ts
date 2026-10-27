import { describe, it, expect } from 'vitest';
import { assetContentDisposition, assetSecurityHeaders } from '../src/lib/routes/assets-cdn';

describe('assetContentDisposition', () => {
	it('shows media a browser renders without script inline', () => {
		for (const type of ['image/png', 'video/mp4', 'audio/mpeg', 'application/pdf']) {
			expect(assetContentDisposition(type, 'a.bin')).toMatch(/^inline;/);
		}
	});

	it('downloads SVG however the stored type is spelled', () => {
		for (const type of [
			'image/svg+xml',
			'image/SVG+xml',
			'image/svg+xml; charset=utf-8',
			' image/svg+xml'
		]) {
			expect(assetContentDisposition(type, 'logo.svg')).toMatch(/^attachment;/);
		}
	});

	it('downloads every other type, and a missing one', () => {
		for (const type of [
			'text/html',
			'text/plain',
			'application/octet-stream',
			'',
			null,
			undefined
		]) {
			expect(assetContentDisposition(type, 'x')).toMatch(/^attachment;/);
		}
	});

	it('keeps a non-ASCII filename out of the quoted ASCII parameter', () => {
		const header = assetContentDisposition('image/png', 'Bild "1".png');
		expect(header).toBe(
			`inline; filename="Bild_1.png"; filename*=UTF-8''${encodeURIComponent('Bild "1".png')}`
		);
	});
});

describe('assetSecurityHeaders', () => {
	it('sandboxes SVG however the stored type is spelled', () => {
		for (const type of ['image/svg+xml', 'IMAGE/SVG+XML', 'image/svg+xml;charset=utf-8']) {
			expect(assetSecurityHeaders(type)).toEqual({
				'Content-Security-Policy': "default-src 'none'; sandbox"
			});
		}
	});

	it('adds nothing for other types', () => {
		expect(assetSecurityHeaders('image/png')).toEqual({});
		expect(assetSecurityHeaders(null)).toEqual({});
	});
});

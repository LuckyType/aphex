import { describe, expect, it } from 'vitest';
import { detectMimeType } from '../src/lib/utils/mime-detect';

describe('detectMimeType for WebM', () => {
	it('reads an EBML header with the webm DocType as video/webm', () => {
		const header = Buffer.concat([
			Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x86, 0x81, 0x01, 0x42, 0x82, 0x84]),
			Buffer.from('webm', 'ascii'),
			Buffer.alloc(32)
		]);
		expect(detectMimeType(header)).toBe('video/webm');
	});

	it('leaves a Matroska file that is not WebM alone', () => {
		const header = Buffer.concat([
			Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x86, 0x81, 0x01, 0x42, 0x82, 0x88]),
			Buffer.from('matroska', 'ascii'),
			Buffer.alloc(32)
		]);
		expect(detectMimeType(header)).not.toBe('video/webm');
	});
});

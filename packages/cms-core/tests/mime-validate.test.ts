import { describe, expect, it } from 'vitest';
import { validateFile } from '../src/lib/utils/mime-detect';

describe('validateFile allowed types', () => {
	const text = Buffer.from('plain notes\n', 'utf8');

	it('accepts a declared type that carries parameters', () => {
		const result = validateFile(text, 'notes.txt', 'text/plain;charset=utf-8', {
			allowedMimeTypes: ['text/plain']
		});
		expect(result.valid).toBe(true);
	});

	it('compares the declared type case-insensitively', () => {
		const result = validateFile(text, 'notes.txt', 'Text/Plain; charset=UTF-8', {
			allowedMimeTypes: ['text/plain']
		});
		expect(result.valid).toBe(true);
	});

	it('still refuses a type that is not allowed, naming it without parameters', () => {
		const result = validateFile(text, 'notes.txt', 'text/plain;charset=utf-8', {
			allowedMimeTypes: ['image/*']
		});
		expect(result.valid).toBe(false);
		expect(result.error).toBe('File type "text/plain" is not allowed');
	});
});

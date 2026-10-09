import { describe, expect, it } from 'vitest';
import { storedMimeType, validateFile } from '../src/lib/utils/mime-detect';

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

describe('storedMimeType', () => {
	it('keeps a detected type', () => {
		expect(storedMimeType('image/png', 'text/plain')).toBe('image/png');
	});

	it('keeps a declared text type for content with no signature, without parameters', () => {
		expect(storedMimeType(null, 'text/plain;charset=utf-8')).toBe('text/plain');
		expect(storedMimeType(null, 'Text/CSV')).toBe('text/csv');
	});

	it('never stores an unidentified file as a non-text type the client claims', () => {
		expect(storedMimeType(null, 'image/png')).toBe('application/octet-stream');
		expect(storedMimeType(null, '')).toBe('application/octet-stream');
	});

	it('never stores a dangerous text type', () => {
		expect(storedMimeType(null, 'text/html')).toBe('application/octet-stream');
		expect(storedMimeType(null, 'text/xml')).toBe('application/octet-stream');
	});
});

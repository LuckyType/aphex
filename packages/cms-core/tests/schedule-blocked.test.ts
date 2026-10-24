import { describe, expect, it } from 'vitest';
import { scheduleBlockedReason } from '../src/lib/save-state-context.svelte';

const base = {
	enabled: false,
	action: 'publish' as const,
	saving: false,
	hasChanges: true,
	hasErrors: false
};

describe('scheduleBlockedReason', () => {
	it('is null while the button is enabled', () => {
		expect(scheduleBlockedReason({ ...base, enabled: true, hasErrors: true })).toBeNull();
	});

	it('names shown errors when a document with changes cannot be published', () => {
		expect(scheduleBlockedReason({ ...base, hasErrors: true })).toBe('errors');
	});

	it('says there is nothing to publish only when nothing changed', () => {
		expect(scheduleBlockedReason({ ...base, hasChanges: false })).toBe('nothing');
		expect(scheduleBlockedReason({ ...base, hasChanges: false, hasErrors: true })).toBe('nothing');
	});

	it('says it is saving while a save runs', () => {
		expect(scheduleBlockedReason({ ...base, saving: true, hasErrors: true })).toBe('saving');
		expect(scheduleBlockedReason({ ...base, action: 'unpublish', saving: true })).toBe('saving');
	});
});

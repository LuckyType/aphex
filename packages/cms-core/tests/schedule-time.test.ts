import { describe, expect, it } from 'vitest';
import { formatScheduleTime, initialScheduleRunAt } from '../src/lib/utils/schedule-time';

describe('initialScheduleRunAt', () => {
	const now = new Date('2026-10-09T20:00:00Z');

	it('starts one hour out without a schedule', () => {
		expect(initialScheduleRunAt(undefined, now).toISOString()).toBe('2026-10-09T21:00:00.000Z');
	});

	it('starts at the scheduled time when rescheduling', () => {
		expect(initialScheduleRunAt('2026-10-10T12:05:00Z', now).toISOString()).toBe(
			'2026-10-10T12:05:00.000Z'
		);
	});

	it('ignores a scheduled time that has passed or does not parse', () => {
		expect(initialScheduleRunAt('2026-10-09T19:00:00Z', now).toISOString()).toBe(
			'2026-10-09T21:00:00.000Z'
		);
		expect(initialScheduleRunAt('not a date', now).toISOString()).toBe('2026-10-09T21:00:00.000Z');
	});
});

describe('formatScheduleTime', () => {
	const at = new Date(2026, 9, 10, 14, 5, 30);

	it('shows hour and minute without seconds in the locale', () => {
		expect(formatScheduleTime(at, 'de-DE')).toBe('10.10.2026, 14:05');
		expect(formatScheduleTime(at, 'en-US', false)).toMatch(/2026.* 14:05$/);
	});

	it('follows a 12-hour clock when asked', () => {
		expect(formatScheduleTime(at, 'en-US', true)).toMatch(/2026.* 2:05\sPM$/);
	});
});

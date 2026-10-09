import { Time } from '@internationalized/date';
import { afterEach, describe, expect, it } from 'vitest';
import { configureStudioI18n } from '../src/lib/i18n/index';
import { readTime, segmentText, writeTime } from '../src/lib/utils/time-of-day';

describe('time of day', () => {
	it('reads a stored HH:MM', () => {
		expect(readTime('07:05')).toEqual(new Time(7, 5));
		expect(readTime('23:59')).toEqual(new Time(23, 59));
	});

	it('reads nothing from blank or invalid input', () => {
		for (const value of ['', '7:05', '24:00', '12:60', null, 3]) {
			expect(readTime(value)).toBeUndefined();
		}
	});

	it('writes a zero-padded 24-hour time', () => {
		expect(writeTime(new Time(18, 0))).toBe('18:00');
		expect(writeTime(undefined)).toBe('');
	});

	describe('segment text', () => {
		afterEach(() => configureStudioI18n({}));

		it('shows a typed segment as it is', () => {
			expect(segmentText('07')).toBe('07');
		});

		it("shows an empty segment as bits-ui's en dashes unless the catalog replaces them", () => {
			const empty = '\u2013\u2013';
			expect(segmentText(empty)).toBe(empty);
			configureStudioI18n({ messages: { [`empty time segment|${empty}`]: '--' } });
			expect(segmentText(empty)).toBe('--');
		});
	});
});

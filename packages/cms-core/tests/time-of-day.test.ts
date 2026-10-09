import { Time } from '@internationalized/date';
import { describe, expect, it } from 'vitest';
import { readTime, writeTime } from '../src/lib/utils/time-of-day';

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
});

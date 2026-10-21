import { afterEach, describe, expect, it } from 'vitest';
import { configureStudioI18n } from '../src/lib/i18n/index';
import {
	dateFormatHint,
	fieldDateFormat,
	fieldTimeFormat,
	parseDateInput,
	parseDateTimeInput,
	studioDateFormat,
	studioTimeFormat
} from '../src/lib/utils/date-format';
import { Rule } from '../src/lib/field-validation/rule';

afterEach(() => configureStudioI18n({}));

describe('studio date formats', () => {
	it('keeps ISO without a configured locale', () => {
		expect(studioDateFormat()).toBe('YYYY-MM-DD');
		expect(studioTimeFormat()).toBe('HH:mm');
	});

	it("follows the configured locale's numeric date and hour cycle", () => {
		configureStudioI18n({ locale: 'de-DE' });
		expect(studioDateFormat()).toBe('DD.MM.YYYY');
		expect(studioTimeFormat()).toBe('HH:mm');
		configureStudioI18n({ locale: 'en-US' });
		expect(studioDateFormat()).toBe('MM/DD/YYYY');
		expect(studioTimeFormat()).toBe('h:mm A');
		configureStudioI18n({ locale: 'en-US', hourCycle: 24 });
		expect(studioTimeFormat()).toBe('HH:mm');
	});

	it("lets a field's own format win", () => {
		configureStudioI18n({ locale: 'de-DE' });
		expect(fieldDateFormat({ options: { dateFormat: 'YYYY/MM/DD' } })).toBe('YYYY/MM/DD');
		expect(fieldDateFormat({})).toBe('DD.MM.YYYY');
		expect(fieldTimeFormat({ options: { timeFormat: 'HH:mm:ss' } })).toBe('HH:mm:ss');
	});
});

describe('parseDateInput', () => {
	it('reads the format, its short forms and ISO', () => {
		const format = 'DD.MM.YYYY';
		expect(parseDateInput('24.12.2026', format)).toBe('2026-12-24');
		expect(parseDateInput('5.3.2026', format)).toBe('2026-03-05');
		expect(parseDateInput('24.12.26', format)).toBe('2026-12-24');
		expect(parseDateInput(' 2026-12-24 ', format)).toBe('2026-12-24');
	});

	it('refuses days that do not exist and unfinished entries', () => {
		expect(parseDateInput('31.02.2026', 'DD.MM.YYYY')).toBeNull();
		expect(parseDateInput('24.12.', 'DD.MM.YYYY')).toBeNull();
		expect(parseDateInput('2', 'DD.MM.YYYY')).toBeNull();
	});
});

describe('parseDateTimeInput', () => {
	const at = (text: string) =>
		parseDateTimeInput(text, 'DD.MM.YYYY', 'HH:mm')?.format('YYYY-MM-DD HH:mm');

	it('reads a German date and time, an hour alone and a comma', () => {
		expect(at('24.12.2026 18:00')).toBe('2026-12-24 18:00');
		expect(at('24.12.26 18')).toBe('2026-12-24 18:00');
		expect(at('24.12.2026, 9:05')).toBe('2026-12-24 09:05');
	});

	it('still reads ISO', () => {
		expect(at('2026-12-24 18:00')).toBe('2026-12-24 18:00');
		expect(at('2026-12-24T18:00')).toBe('2026-12-24 18:00');
	});

	it('refuses a date without a time', () => {
		expect(at('24.12.2026')).toBeUndefined();
	});
});

describe('dateFormatHint', () => {
	it('shows the tokens through the catalog', () => {
		expect(dateFormatHint('DD.MM.YYYY HH:mm')).toBe('DD.MM.YYYY HH:mm');
		configureStudioI18n({
			messages: {
				'date format|DD': 'TT',
				'date format|YYYY': 'JJJJ',
				'date format|mm': 'MM'
			}
		});
		expect(dateFormatHint('DD.MM.YYYY HH:mm')).toBe('TT.MM.JJJJ HH:MM');
	});

	it('is the format the rule names', async () => {
		configureStudioI18n({ messages: { 'date format|DD': 'TT', 'date format|YYYY': 'JJJJ' } });
		const markers = await new Rule().date('DD.MM.YYYY').validate('24/12/2026', { path: ['day'] });
		expect(markers[0]?.message).toBe('Invalid date format. Expected: TT.MM.JJJJ');
	});
});

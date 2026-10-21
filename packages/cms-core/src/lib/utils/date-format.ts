// The formats date and datetime fields show and accept. A field's own
// `options.dateFormat`/`timeFormat` wins; without one the Studio's configured
// locale decides (24.12.2026 and 18:00 for German), and without a locale the
// ISO forms stay as they always were. What is stored never changes: ISO
// dates and ISO UTC datetimes. Plain TS, safe for the universal barrel.
import dayjs, { type Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import * as i18n from '../i18n/index';

dayjs.extend(customParseFormat);

const ISO_DATE = 'YYYY-MM-DD';
const ISO_TIME = 'HH:mm';

/** A day whose parts all differ, so each part of a formatted date is told apart. */
const SAMPLE = new Date(2026, 11, 24, 18, 30);

/** dayjs tokens for the `Intl` parts of a numeric date. */
const DATE_PART_TOKENS: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {
	day: 'DD',
	month: 'MM',
	year: 'YYYY'
};

function literal(text: string): string {
	// dayjs reads letters as tokens, so a literal with any goes in brackets.
	return /[a-z]/i.test(text) ? `[${text}]` : text;
}

/** The date format the Studio's locale writes numerically, or ISO without a locale. */
export function studioDateFormat(): string {
	const locale = i18n.locale();
	if (!locale) return ISO_DATE;
	try {
		const parts = new Intl.DateTimeFormat(locale, {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		}).formatToParts(SAMPLE);
		const format = parts
			.map((part) => DATE_PART_TOKENS[part.type] ?? literal(part.value))
			.join('')
			.trim();
		return /DD/.test(format) && /MM/.test(format) && /YYYY/.test(format) ? format : ISO_DATE;
	} catch {
		return ISO_DATE;
	}
}

/** The time format the Studio's hour cycle (or its locale's) writes: `HH:mm` or `h:mm A`. */
export function studioTimeFormat(): string {
	const twelve = i18n.hour12();
	if (twelve !== undefined) return twelve ? 'h:mm A' : ISO_TIME;
	const locale = i18n.locale();
	if (!locale) return ISO_TIME;
	try {
		const cycle = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle;
		return cycle === 'h11' || cycle === 'h12' ? 'h:mm A' : ISO_TIME;
	} catch {
		return ISO_TIME;
	}
}

interface DateFormatOptions {
	options?: { dateFormat?: string; timeFormat?: string };
}

/** The date format `field` shows and accepts. */
export function fieldDateFormat(field: DateFormatOptions | null | undefined): string {
	return field?.options?.dateFormat || studioDateFormat();
}

/** The time format a datetime `field` shows and accepts. */
export function fieldTimeFormat(field: DateFormatOptions | null | undefined): string {
	return field?.options?.timeFormat || studioTimeFormat();
}

/**
 * `format` and the looser forms people type for it: a day or month without
 * its leading zero (5.3.2026) and a two-digit year (24.12.26).
 */
function dateVariants(format: string): string[] {
	const variants = new Set<string>([format]);
	for (const [long, short] of [
		['DD', 'D'],
		['MM', 'M'],
		['YYYY', 'YY']
	] as const) {
		for (const variant of [...variants]) {
			if (variant.includes(long)) variants.add(variant.replace(long, short));
		}
	}
	return [...variants];
}

function timeVariants(format: string): string[] {
	if (/A|a/.test(format)) return [format, 'h:mm A', 'hh:mm A', 'h A', 'h:mm a', 'h a', ISO_TIME];
	// An hour alone (18) means the full hour.
	return [format, 'HH:mm', 'H:mm', 'HH', 'H'];
}

/** Commas and runs of spaces read as one space: "24.12.2026, 18:00". */
function normalize(text: string): string {
	return text.trim().replace(/\s*,\s*|\s+/g, ' ');
}

function firstValid(text: string, formats: readonly string[]): Dayjs | null {
	for (const format of formats) {
		const parsed = dayjs(text, format, true);
		if (parsed.isValid()) return parsed;
	}
	return null;
}

/**
 * The ISO date (`YYYY-MM-DD`) `text` names in `format` or one of its looser
 * forms, or in ISO itself; null when it names none.
 */
export function parseDateInput(text: string, format: string): string | null {
	const parsed = firstValid(normalize(text), [...dateVariants(format), ISO_DATE]);
	return parsed ? parsed.format(ISO_DATE) : null;
}

/**
 * The local date and time `text` names in `dateFormat` and `timeFormat` (or
 * their looser forms, or ISO), or null when it names none.
 */
export function parseDateTimeInput(
	text: string,
	dateFormat: string,
	timeFormat: string
): Dayjs | null {
	const value = normalize(text);
	const formats: string[] = [];
	for (const date of [...dateVariants(dateFormat), ISO_DATE]) {
		for (const time of timeVariants(timeFormat)) formats.push(`${date} ${time}`);
	}
	formats.push('YYYY-MM-DDTHH:mm', 'YYYY-MM-DDTHH:mm:ss');
	return firstValid(value, formats);
}

/**
 * `format` as a person reads it, its tokens put through the Studio's
 * translations under the `date format` context (`YYYY` becomes `JJJJ` in a
 * German catalog): the placeholder of a date field and the format its error
 * names.
 */
export function dateFormatHint(format: string): string {
	return format.replace(/\[([^\]]*)\]|YYYY|YY|MM|DD|HH|hh|mm|ss|M|D|H|h|A|a/g, (token, text) =>
		text !== undefined ? text : i18n.t(token, undefined, 'date format')
	);
}

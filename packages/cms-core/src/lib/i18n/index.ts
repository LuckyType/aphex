// Studio localization.
//
// Every piece of text the Studio shows goes through `t(source)`, where
// `source` is the English text with `{name}` placeholders. An app hands the
// Studio a catalog keyed by those English sources with `configureStudioI18n`
// (once, before the Studio renders); any source missing from it falls back
// to the English. Plain TS, safe for the universal barrel.

export type MessageParams = Record<string, string | number | null | undefined>;

/**
 * A translation: one text, or one per plural category of the locale
 * (`Intl.PluralRules`), picked by the `count` param.
 */
export type Message = string | Partial<Record<Intl.LDMLPluralRule, string>>;

export interface StudioI18n {
	/**
	 * BCP 47 tag for dates and numbers (`toLocaleString`, `Intl`). Unset, the
	 * browser's own language is used.
	 */
	locale?: string;
	/** Hour cycle for times the Studio shows or asks for. Unset, the locale decides. */
	hourCycle?: 12 | 24;
	/**
	 * Translations keyed by English source, or by `context|source` where the
	 * same English needs two translations (see `t`'s `context`).
	 */
	messages?: Readonly<Record<string, Message>>;
	/** A label taken from a schema at render time, such as a group or type title. */
	label?: (text: string) => string;
	/** A validation message written by the rule engine. */
	validationMessage?: (text: string) => string;
	/** A document type's plural for list headings; `fallback` is the English one. */
	plural?: (title: string, fallback: (title: string) => string) => string;
}

let current: StudioI18n = {};

export function configureStudioI18n(options: StudioI18n): void {
	current = options;
}

export function studioI18n(): Readonly<StudioI18n> {
	return current;
}

function interpolate(template: string, params: MessageParams | undefined): string {
	return template.replace(/\{\{|\}\}|\{(\w+)\}/g, (match, name: string | undefined) => {
		if (match === '{{') return '{';
		if (match === '}}') return '}';
		const value = params?.[name as string];
		return value === undefined || value === null ? '' : String(value);
	});
}

/**
 * The text for `source` in the configured language. `context` tells apart two
 * uses of the same English that translate differently ("Cancel" a dialog
 * versus "Cancel" a schedule); it is looked up as `context|source`, then as
 * `source`.
 */
export function t(source: string, params?: MessageParams, context?: string): string {
	const messages = current.messages;
	const message =
		(context !== undefined ? messages?.[`${context}|${source}`] : undefined) ?? messages?.[source];
	return interpolate(pick(message, params?.count) ?? source, params);
}

/**
 * Text that depends on a count, given as its English singular and plural.
 * The catalog entry is keyed by `other`; a translation with plural
 * categories picks its own form for `count`.
 */
export function tn(
	count: number,
	one: string,
	other: string,
	params?: MessageParams,
	context?: string
): string {
	const all = { count, ...params };
	const messages = current.messages;
	const message =
		(context !== undefined ? messages?.[`${context}|${other}`] : undefined) ?? messages?.[other];
	return interpolate(pick(message, count) ?? (count === 1 ? one : other), all);
}

function pick(message: Message | undefined, count: unknown): string | undefined {
	if (message === undefined || typeof message === 'string') return message;
	const category =
		typeof count === 'number' ? new Intl.PluralRules(current.locale).select(count) : 'other';
	return message[category] ?? message.other;
}

/** The configured locale, or undefined for the browser's own. */
export function locale(): string | undefined {
	return current.locale;
}

/**
 * Whether times read in 12-hour form. Follows `hourCycle`, else the locale's
 * own convention (undefined lets `Intl` decide).
 */
export function hour12(): boolean | undefined {
	return current.hourCycle === undefined ? undefined : current.hourCycle === 12;
}

export function label(text: string): string {
	return current.label ? current.label(text) : text;
}

export function validationMessage(text: string): string {
	return current.validationMessage ? current.validationMessage(text) : text;
}

export function plural(title: string, fallback: (title: string) => string): string {
	return current.plural ? current.plural(title, fallback) : fallback(title);
}

/**
 * The text before and after `{slot}` in `source`'s translation, for markup
 * that wraps one part of a sentence (`Inspecting <em>{title}</em>`).
 */
export function tParts(source: string, slot: string, params?: MessageParams): [string, string] {
	const marker = `\u0000${slot}\u0000`;
	const text = t(source, { ...params, [slot]: marker });
	const at = text.indexOf(marker);
	return at < 0 ? [text, ''] : [text.slice(0, at), text.slice(at + marker.length)];
}

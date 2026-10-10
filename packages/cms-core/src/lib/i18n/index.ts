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
	/**
	 * A message the app's rules write at run time: a validation message, or a
	 * schema `lock`'s reason shown on the locked field.
	 */
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

/**
 * `text` as the configured `label` translates it, or unchanged. Schema code
 * calls it as `studioLabel` for a label it writes itself at render time, such
 * as a `preview.prepare` fallback ("Untitled item"), which `localizeSchema`
 * cannot reach because it is mixed with document data.
 */
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

/**
 * A copy of `schema` with every label an editor reads put through `label()`:
 * the schema's own `title`, `description` and literal `preview.title` (a
 * singleton's heading), its groups and orderings, and,
 * recursively, each field's `title`, `description` and `list` option titles,
 * the item types of an array (their titles and fields) and a block's styles,
 * lists and marks. Everything else, functions included, is kept by reference.
 * Without a configured `label` the schema comes back as it was, so an app
 * registers its schemas in English once and never rewrites them.
 */
export function localizeSchema<T extends SchemaLike>(schema: T): T {
	if (!current.label) return schema;
	return localizeType(schema) as T;
}

/** The subset of a schema or type reference this module reads. */
interface SchemaLike {
	title?: string;
	description?: string;
	fields?: readonly FieldLike[];
	groups?: readonly { title: string }[];
	orderings?: readonly { title: string }[];
	preview?: { title?: unknown };
}

interface FieldLike {
	title?: string;
	description?: string;
	fields?: readonly FieldLike[];
	of?: readonly TypeRefLike[];
	list?: readonly ListOptionLike[] | { options: Record<string, readonly ListOptionLike[]> };
}

type ListOptionLike = string | { title: string };

interface TypeRefLike extends SchemaLike {
	styles?: readonly { title: string }[];
	lists?: readonly { title: string }[];
	marks?: {
		decorators?: readonly { title: string }[];
		annotations?: readonly { title?: string; fields?: readonly FieldLike[] }[];
	};
}

function localizeTitled<T extends { title: string }>(
	items: readonly T[] | undefined
): T[] | undefined {
	return items?.map((item) => ({ ...item, title: label(item.title) }));
}

function localizeText<T extends { title?: string; description?: string }>(item: T): T {
	const copy = { ...item };
	if (typeof item.title === 'string') copy.title = label(item.title);
	if (typeof item.description === 'string') copy.description = label(item.description);
	return copy;
}

function localizeType<T extends SchemaLike>(type: T): T {
	const copy = localizeText(type);
	if (type.fields) copy.fields = type.fields.map(localizeField);
	if (type.groups) copy.groups = localizeTitled(type.groups);
	if (type.orderings) copy.orderings = localizeTitled(type.orderings);
	if (typeof type.preview?.title === 'string') {
		copy.preview = { ...type.preview, title: label(type.preview.title) };
	}
	return copy;
}

function localizeListOption(option: ListOptionLike): ListOptionLike {
	return typeof option === 'string' ? option : { ...option, title: label(option.title) };
}

function localizeField<T extends FieldLike>(field: T): T {
	const copy = localizeText(field);
	if (field.fields) copy.fields = field.fields.map(localizeField);
	if (field.of) copy.of = field.of.map(localizeTypeRef);
	if (Array.isArray(field.list)) {
		copy.list = field.list.map(localizeListOption);
	} else if (field.list && typeof field.list === 'object' && 'options' in field.list) {
		copy.list = {
			...field.list,
			options: Object.fromEntries(
				Object.entries(field.list.options).map(([key, options]) => [
					key,
					options.map(localizeListOption)
				])
			)
		};
	}
	return copy;
}

function localizeTypeRef<T extends TypeRefLike>(ref: T): T {
	const copy = localizeType(ref);
	if (ref.styles) copy.styles = localizeTitled(ref.styles);
	if (ref.lists) copy.lists = localizeTitled(ref.lists);
	if (ref.marks) {
		copy.marks = {
			...ref.marks,
			decorators: localizeTitled(ref.marks.decorators),
			annotations: ref.marks.annotations?.map(localizeType)
		};
	}
	return copy;
}

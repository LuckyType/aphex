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
export declare function configureStudioI18n(options: StudioI18n): void;
export declare function studioI18n(): Readonly<StudioI18n>;
/**
 * The text for `source` in the configured language. `context` tells apart two
 * uses of the same English that translate differently ("Cancel" a dialog
 * versus "Cancel" a schedule); it is looked up as `context|source`, then as
 * `source`.
 */
export declare function t(source: string, params?: MessageParams, context?: string): string;
/**
 * Text that depends on a count, given as its English singular and plural.
 * The catalog entry is keyed by `other`; a translation with plural
 * categories picks its own form for `count`.
 */
export declare function tn(count: number, one: string, other: string, params?: MessageParams, context?: string): string;
/** The configured locale, or undefined for the browser's own. */
export declare function locale(): string | undefined;
/**
 * Whether times read in 12-hour form. Follows `hourCycle`, else the locale's
 * own convention (undefined lets `Intl` decide).
 */
export declare function hour12(): boolean | undefined;
export declare function label(text: string): string;
export declare function validationMessage(text: string): string;
export declare function plural(title: string, fallback: (title: string) => string): string;
/**
 * The text before and after `{slot}` in `source`'s translation, for markup
 * that wraps one part of a sentence (`Inspecting <em>{title}</em>`).
 */
export declare function tParts(source: string, slot: string, params?: MessageParams): [string, string];
//# sourceMappingURL=index.d.ts.map
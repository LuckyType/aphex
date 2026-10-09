// Studio localization.
//
// Every piece of text the Studio shows goes through `t(source)`, where
// `source` is the English text with `{name}` placeholders. An app hands the
// Studio a catalog keyed by those English sources with `configureStudioI18n`
// (once, before the Studio renders); any source missing from it falls back
// to the English. Plain TS, safe for the universal barrel.
let current = {};
export function configureStudioI18n(options) {
    current = options;
}
export function studioI18n() {
    return current;
}
function interpolate(template, params) {
    return template.replace(/\{\{|\}\}|\{(\w+)\}/g, (match, name) => {
        if (match === '{{')
            return '{';
        if (match === '}}')
            return '}';
        const value = params?.[name];
        return value === undefined || value === null ? '' : String(value);
    });
}
/**
 * The text for `source` in the configured language. `context` tells apart two
 * uses of the same English that translate differently ("Cancel" a dialog
 * versus "Cancel" a schedule); it is looked up as `context|source`, then as
 * `source`.
 */
export function t(source, params, context) {
    const messages = current.messages;
    const message = (context !== undefined ? messages?.[`${context}|${source}`] : undefined) ?? messages?.[source];
    return interpolate(pick(message, params?.count) ?? source, params);
}
/**
 * Text that depends on a count, given as its English singular and plural.
 * The catalog entry is keyed by `other`; a translation with plural
 * categories picks its own form for `count`.
 */
export function tn(count, one, other, params, context) {
    const all = { count, ...params };
    const messages = current.messages;
    const message = (context !== undefined ? messages?.[`${context}|${other}`] : undefined) ?? messages?.[other];
    return interpolate(pick(message, count) ?? (count === 1 ? one : other), all);
}
function pick(message, count) {
    if (message === undefined || typeof message === 'string')
        return message;
    const category = typeof count === 'number' ? new Intl.PluralRules(current.locale).select(count) : 'other';
    return message[category] ?? message.other;
}
/** The configured locale, or undefined for the browser's own. */
export function locale() {
    return current.locale;
}
/**
 * Whether times read in 12-hour form. Follows `hourCycle`, else the locale's
 * own convention (undefined lets `Intl` decide).
 */
export function hour12() {
    return current.hourCycle === undefined ? undefined : current.hourCycle === 12;
}
export function label(text) {
    return current.label ? current.label(text) : text;
}
export function validationMessage(text) {
    return current.validationMessage ? current.validationMessage(text) : text;
}
export function plural(title, fallback) {
    return current.plural ? current.plural(title, fallback) : fallback(title);
}
/**
 * The text before and after `{slot}` in `source`'s translation, for markup
 * that wraps one part of a sentence (`Inspecting <em>{title}</em>`).
 */
export function tParts(source, slot, params) {
    const marker = `\u0000${slot}\u0000`;
    const text = t(source, { ...params, [slot]: marker });
    const at = text.indexOf(marker);
    return at < 0 ? [text, ''] : [text.slice(0, at), text.slice(at + marker.length)];
}

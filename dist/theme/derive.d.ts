/**
 * Derive the admin schema and the runtime CSS-var map from a token list.
 *
 * `deriveThemeFields()` feeds the `theme` singleton schema; `deriveThemeVars()`
 * turns a saved theme document into `{ '--accent': '#…', … }`. Both walk the same
 * token list, so the form and the rendered CSS can never drift. The app supplies
 * the tokens (see the app's `theme/tokens.ts`).
 */
import type { Field, FieldGroup } from '../types/schemas.js';
import type { ThemeToken } from './tokens.js';
/**
 * Build the field-group list for a theme singleton, one group per distinct
 * `token.group` in first-seen order. The first group is marked `default`.
 */
export declare function deriveThemeFieldGroups(tokens: ThemeToken[]): FieldGroup[];
/** Build the field list for the `theme` singleton schema from the token set. */
export declare function deriveThemeFields(tokens: ThemeToken[]): Field[];
/**
 * Resolve a theme document into a `cssVar → value` map, falling back to each
 * token's default when the document omits or blanks a value. Font values are
 * resolved to their full CSS stack; colors pass through (sanitized in ./css.ts).
 *
 * Accepts `unknown` so callers can pass a concrete generated document type (which
 * lacks a string index signature) without casting; keys are read dynamically.
 */
export declare function deriveThemeVars(values: unknown, tokens: ThemeToken[]): Record<string, string>;
//# sourceMappingURL=derive.d.ts.map
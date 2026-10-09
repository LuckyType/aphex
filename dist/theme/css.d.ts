/**
 * Emit theme tokens as a scoped `<style>` body.
 *
 * Two hard rules, both learned the expensive way:
 *  1. NEVER emit site tokens at `:root` — they'd bleed into the admin chrome.
 *     Always scope to the site shell selector.
 *  2. Theme values are user-authored, so sanitize before interpolating. Any value
 *     that could break out of the `--var: value;` declaration (contains `;`, `{`,
 *     `}`, `<`, `>`, or a CSS `url(`/`expression(`) is dropped, and the token's
 *     CSS fallback in the layout applies instead.
 */
/** Return the value if safe to interpolate into a CSS declaration, else null. */
export declare function sanitizeTokenValue(value: string): string | null;
/**
 * Build a sanitized `--var: value; …` declaration list from a `cssVar → value`
 * map (see deriveThemeVars). Suitable for an inline `style` attribute on the site
 * shell element — the simplest way to scope tokens to the site subtree while
 * beating component-CSS specificity, with no `<style>` injection to guard. Returns
 * `''` when nothing survives sanitization.
 */
export declare function emitThemeVars(vars: Record<string, string>): string;
/**
 * Build a scoped style *rule* from a `cssVar → value` map, for callers that
 * prefer injecting a `<style>` block over an inline attribute. Returns `''` when
 * nothing survives sanitization, so callers can skip rendering an empty `<style>`.
 *
 * @param selector CSS selector to scope the custom properties to, e.g. `.blog-shell`.
 */
export declare function emitThemeStyle(selector: string, vars: Record<string, string>): string;
//# sourceMappingURL=css.d.ts.map
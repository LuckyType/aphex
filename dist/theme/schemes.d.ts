/**
 * Color schemes — the reusable palette unit.
 *
 * A scheme is seeded with THREE colors (surface, text, primary). Everything else —
 * the on-primary contrast color, muted/faint text, hairline borders, raised
 * surfaces, the hover-ink of the accent — is DERIVED, so every scheme is
 * internally consistent and the editor tunes three dials instead of eight.
 *
 * Each scheme is emitted as a scoped class (`.scheme-<name>`) that remaps the same
 * CSS custom properties the site components already consume (`--paper`, `--ink`,
 * `--accent`, …). The site shell wears the default scheme; any section can wear a
 * different one by adding its class — that's the page-builder primitive.
 *
 * Typography and layout are deliberately NOT part of a scheme: they're global,
 * the same way Shopify keeps type/layout out of its color schemes.
 */
import type { ArrayField } from '../types/schemas.js';
/** The three seed colors an editor sets per scheme. */
export interface ColorScheme {
    /** Human label; also slugified into the scheme's CSS class. */
    name: string;
    /** Background. */
    surface: string;
    /** Foreground text. */
    text: string;
    /** Accent — links, buttons, highlights. */
    primary: string;
}
/** Slugify a scheme name into a stable, safe CSS class fragment. */
export declare function schemeSlug(name: string): string;
/** The CSS class that carries a scheme's tokens, e.g. `scheme-dark`. */
export declare function schemeClass(name: string): string;
/**
 * Pick a readable on-color (near-black or white) for text/icons that sit on top
 * of `background`. Falls back to white when the color can't be parsed.
 */
export declare function contrastColor(background: string): string;
/**
 * Resolve a scheme's three seeds into the full CSS-var role map. Seeds are
 * sanitized; anything invalid falls back to a sensible default so a scheme always
 * emits a complete, coherent palette. The derived roles are `color-mix`
 * expressions over `var(--ink)`/`var(--paper)`, so they recompute correctly for
 * whichever scheme is in scope — no per-shade user input, no drift.
 */
export declare function resolveSchemeVars(scheme: ColorScheme): Record<string, string>;
/**
 * Emit one scoped rule per scheme, prefixed so it only styles the site subtree
 * (never `:root`/admin chrome). Returns `''` when there are no schemes.
 *
 * @param scopeSelector Ancestor selector the scheme classes live under, e.g. `.blog-shell`.
 */
export declare function emitSchemeStyles(schemes: ColorScheme[], scopeSelector: string): string;
/** Read a theme document's `schemes` array, falling back to `defaults` when absent. */
export declare function readSchemes(values: unknown, defaults: ColorScheme[]): ColorScheme[];
/**
 * Build the `schemes` array field for the theme singleton — a repeatable object
 * of { name, surface, text, primary }. The first scheme is the site default.
 */
export declare function deriveSchemesField(defaults: ColorScheme[], group: string): ArrayField;
//# sourceMappingURL=schemes.d.ts.map
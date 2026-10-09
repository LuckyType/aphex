import type { PreviewConfig } from '../types/schemas.js';
/**
 * The minimum a thing needs to drive a preview row: an optional fallback `title`
 * and a `preview` config. Structural on purpose — both `SchemaType` (documents /
 * objects) and `TypeReference` (array members, Portable Text block types) satisfy
 * it, so array rows and rich-text block cards share one resolver.
 */
export type PreviewSource = {
    title?: string;
    preview?: PreviewConfig;
} | null | undefined;
/**
 * Walk a dot-path (e.g. `seo.title`) through an object. Returns the
 * terminal value, or `undefined` if any segment along the way is missing.
 *
 * Quoted strings (single or double) are treated as literals and returned
 * as-is, e.g. `'"My Title"'` → `'My Title'`. Useful for singletons or
 * any schema that needs a static preview title.
 */
export declare function readPath(item: any, path: string): unknown;
/**
 * Resolve the title to display for an item (array row, document list row,
 * reference picker row, editor breadcrumb). Precedence: `preview.prepare()` →
 * literal `preview.title` → `select.title` dot-path → conventional field names →
 * schema title → type name.
 */
export declare function resolvePreviewTitle(item: any, schema: PreviewSource, defaultTypeLabel?: string): string;
/**
 * Resolve the subtitle to display for an item. Returns `null` when no
 * subtitle is configured or the configured field is empty — callers
 * should branch on the null and skip rendering the subtitle line.
 */
export declare function resolvePreviewSubtitle(item: any, schema: PreviewSource): string | null;
//# sourceMappingURL=preview.d.ts.map
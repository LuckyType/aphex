import type { SchemaType, SearchFieldConfig, TypeReference } from '../types/schemas.js';
/**
 * Schema utility functions that work with a schema registry
 * These functions accept schemas as parameters to avoid package-level dependencies
 */
/**
 * Get a schema type by name from a collection of schemas
 */
export declare function getSchemaByName(schemas: SchemaType[], name: string): SchemaType | null;
/**
 * Get all available object types (for array field dropdowns)
 */
export declare function getObjectTypes(schemas: SchemaType[]): SchemaType[];
/**
 * Get all available document types
 */
export declare function getDocumentTypes(schemas: SchemaType[]): SchemaType[];
/**
 * Check if a schema type exists
 */
export declare function schemaExists(schemas: SchemaType[], name: string): boolean;
/**
 * Build a `search` config from every top-level string-ish field on a schema
 * (`string`, `text`, `slug`, `url`) — the fields worth full-text matching.
 * Doesn't recurse into `object`/`array` fields.
 *
 * Use this to opt a document type into field-wide search instead of hand-listing
 * paths:
 * ```ts
 * const fields = [ ...define fields here... ];
 * export default defineType({
 *   name: 'post',
 *   fields,
 *   search: searchableFields({ fields })
 * })
 * ```
 */
export declare function searchableFields(schema: Pick<SchemaType, 'fields'>): SearchFieldConfig[];
/**
 * Resolve which dot-paths a document's search index is built from: the
 * schema's explicit `search` config if set, else the conventional title-ish
 * fields (`title`/`heading`/`name`/`label`/`slug`) plus whatever
 * `preview.select.title` points to — the same fields `resolvePreviewTitle`
 * already uses to pick a display title.
 */
export declare function resolveSearchPaths(schema: Pick<SchemaType, 'search' | 'preview'>): string[];
/**
 * Flatten the given dot-paths off a document's data into a single normalized
 * string — the value stored in `search_text` and indexed for full-text search.
 */
export declare function buildSearchText(paths: string[], data: Record<string, unknown> | null | undefined): string;
/**
 * Get the available types for an array field
 * Supports both schema references and inline object definitions
 */
export declare function getArrayTypes(schemas: SchemaType[], arrayField: {
    of?: TypeReference[];
}): SchemaType[];
//# sourceMappingURL=utils.d.ts.map
import type { Field, SchemaType } from '../types/schemas.js';
/**
 * Remove all stega-encoded data from a string or deep JSON structure.
 * Use in <svelte:head> (title, meta), alt text, aria-labels — anywhere the raw
 * string is needed without invisible characters.
 */
export declare function stegaClean<T>(value: T): T;
/** Decode the stega payload from a string. Returns null if not encoded. */
export declare function stegaDecode(value: string): {
    field: string;
    blockIndex?: number;
    blockKey?: string;
    arrayIndex?: number;
    objectPath?: string;
} | null;
/**
 * Recursively encode all string-bearing fields in a document with their top-level
 * field name. Handles: string/text/url, string arrays, object subfields, and
 * portable text blocks (including custom block types like callout, codeBlock).
 *
 * Every nested string always encodes the *top-level* field name so that clicking
 * in the preview navigates to the correct editor field.
 */
export declare function stegaEncodeDocument(data: Record<string, unknown>, fields: Field[], schemas?: SchemaType[]): Record<string, unknown>;
//# sourceMappingURL=stega.d.ts.map
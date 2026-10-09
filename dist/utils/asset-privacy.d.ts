import type { Field, SchemaType } from '../types/schemas.js';
/**
 * Walk a dotted field path (`coverImage`, `seo.ogImage`) to its definition.
 *
 * Descends through `object` fields only. A path into an array or a named type
 * reference returns null rather than guessing — see {@link resolveFieldPrivacy}
 * for what a null means.
 */
export declare function findFieldByPath(fields: Field[], path: string): Field | null;
/**
 * Is the field at this path private?
 *
 * `true`/`false` when the field resolves, and **`null` when it doesn't** — the
 * schema is gone, the field was renamed, or the path leads somewhere this walker
 * doesn't follow. Null is deliberately distinct from `false`: the caller has a
 * stored fallback for "unknown" and must not read it as "public".
 */
export declare function resolveFieldPrivacy(schema: SchemaType | null | undefined, fieldPath: string | undefined): boolean | null;
/**
 * The final answer, from the live schema first and the stamped value second.
 *
 * Order matters. The live schema wins whenever it can answer, so toggling
 * `private` in code still takes effect at once for every asset pointing at that
 * field. The stamp is consulted only when the pointer no longer resolves, which
 * is exactly the rename/delete case that used to fail open.
 *
 * An asset with neither — uploaded through the media library before this
 * existed, or through the API with no field context — is public, as it always
 * was. Treating "no information at all" as private would turn every existing
 * library asset inaccessible overnight, which is a different kind of broken.
 */
export declare function isAssetPrivate(resolved: boolean | null, stampedPrivate: unknown): {
    isPrivate: boolean;
    usedFallback: boolean;
};
//# sourceMappingURL=asset-privacy.d.ts.map
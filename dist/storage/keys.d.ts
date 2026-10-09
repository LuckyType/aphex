/**
 * Storage key layout.
 *
 * Every asset owns a directory named by its id, and the file it was uploaded
 * with is `original.{ext}` inside it:
 *
 *     {assetId}/original.png
 *     {assetId}/w800-a1b2c3.webp     ← later, generated variants
 *
 * Two properties matter, and both come from the same decision:
 *
 * - **Derivable.** The key follows from the asset id alone, so a sibling — a
 *   resized variant — can be addressed without reading the row back or knowing
 *   how the adapter stores things. The previous flat layout invented a name per
 *   adapter (` (1)` suffixes locally, timestamp + random on S3), which made
 *   `asset.path` unpredictable and left nowhere to put a variant.
 * - **Opaque.** No organization segment and no user-supplied filename. The org
 *   lives on the row, so putting it in the key would leak org ids into storage
 *   paths and force a copy if an asset ever moved between orgs; user filenames
 *   in keys invite collisions and traversal for no benefit, since the display
 *   name is `asset.originalFilename` and is free to change independently.
 *
 * Assets stored under the old flat layout keep their existing `path` and keep
 * working — this applies to new uploads only.
 */
/**
 * Pick a safe extension for a stored file.
 *
 * Prefers the uploaded filename's own extension, falls back to the MIME type,
 * and finally to `bin`. The result is always lowercase alphanumerics, so it
 * can't introduce a path separator or a leading dot of its own.
 */
export declare function extensionFor(originalFilename: string, mimeType?: string): string;
/**
 * Adapter-relative key for an asset's original file: `{assetId}/original.{ext}`.
 */
export declare function buildOriginalKey(assetId: string, originalFilename: string, mimeType?: string): string;
/**
 * Public URL for an asset: the `/media/:id/:filename` route.
 *
 * The route resolves the asset by id alone — the filename segment is cosmetic,
 * there so a saved file lands with a sensible name and so the URL is readable.
 * That's what lets an asset be renamed without touching storage: only this URL
 * changes, and the bytes stay where they are.
 */
export declare function buildAssetUrl(assetId: string, originalFilename: string): string;
/** Format every derivative is encoded in. Not configurable at V1. */
/**
 * Filename segment that addresses a video's poster frame rather than the asset
 * itself: `/media/{id}/poster.webp`.
 *
 * A poster is deliberately not an image *variant*. Variants are a responsive
 * ladder keyed by width and config hash, regenerated when the image config
 * changes; a poster is one derived frame whose only input is the video, so it
 * has no ladder, no hash, and nothing to regenerate against.
 */
export declare const POSTER_FILENAME = "poster.webp";
/** Storage key for a video's poster frame, alongside its original. */
export declare function buildPosterKey(assetId: string): string;
/** Public URL for a video's poster frame. */
export declare function buildPosterUrl(assetId: string): string;
export declare const VARIANT_FORMAT = "webp";
export interface ParsedVariant {
    width: number;
    configHash: string;
    format: string;
}
/**
 * Recognise a variant request in the route's filename segment.
 *
 * Returns null for anything else — an original's real filename, a stale link,
 * or junk — which the route serves as the original. The width is bounded by the
 * pattern itself so an absurd value can't reach a resizer.
 */
export declare function parseVariantFilename(filename: string): ParsedVariant | null;
/** `w800-a1b2c3.webp` */
export declare function variantFilename(width: number, configHash: string): string;
/** Adapter-relative key for a derivative, a sibling of the original. */
export declare function buildVariantKey(assetId: string, width: number, configHash: string): string;
/** Public URL for a derivative, on the same route as the original. */
export declare function buildVariantUrl(assetId: string, width: number, configHash: string): string;
/**
 * Stable short hash of the image config.
 *
 * FNV-1a rather than a crypto digest because this has to run in the browser:
 * `<Image>` builds variant URLs for derivatives that may not exist yet, so it
 * needs the same hash the server will use, and Node's `crypto` isn't available
 * to it. It is a cache key, not a security boundary — a collision would serve
 * a correctly-sized image at a slightly different quality, which is why a
 * 32-bit hash is enough.
 */
export declare function imageConfigHash(config: {
    widths: number[];
    quality?: number;
}): string;
//# sourceMappingURL=keys.d.ts.map
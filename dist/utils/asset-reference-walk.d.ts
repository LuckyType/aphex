/** One asset reference found in a document's data. */
export interface FoundAssetReference {
    /** The referenced asset's id. */
    assetId: string;
    /**
     * Dotted/bracketed path to the field holding the reference, e.g.
     * `coverImage`, `seo.ogImage`, `content[3]`, `gallery.images[2]`.
     *
     * Array indices are positions at the time of the write. They are a label for
     * a human, not a stable address: reordering an array changes them, and the
     * index is rebuilt on every write anyway, so nothing depends on them lasting.
     */
    fieldPath: string;
}
/**
 * Collect every asset reference in a document's data.
 *
 * Deduplicated by `assetId` + `fieldPath`, so the same asset used twice in
 * different fields yields two rows, while the same asset at the same path (which
 * shouldn't happen, but costs nothing to guard) yields one.
 */
export declare function collectAssetReferences(data: unknown): FoundAssetReference[];
/**
 * Every asset id reachable anywhere in the data, ignoring structure entirely.
 *
 * The unstructured twin of {@link collectAssetReferences}, and deliberately dumb:
 * it descends through everything and collects any `asset: { _ref }` it meets, at
 * any depth, under any wrapper, with no notion of which shapes are legitimate.
 * It therefore cannot tell you *where* a reference lives, which is why it is not
 * the indexer.
 *
 * It exists to check the indexer. The walker is a structural allowlist — it finds
 * references in the shapes it knows — while the delete guard is a substring scan
 * that finds them in shapes nobody anticipated. That asymmetry is permanent, and
 * every gap it has produced looked identical from the outside: an asset that
 * reads as unused and then refuses to delete. Comparing these two sets turns the
 * next such gap into a log line at rebuild time instead of a support question
 * months later.
 *
 * Not a substitute for the guard's scan: that one matches raw text, so it also
 * catches an id sitting somewhere this doesn't model at all.
 */
export declare function collectAssetIdsUnstructured(data: unknown): Set<string>;
//# sourceMappingURL=asset-reference-walk.d.ts.map
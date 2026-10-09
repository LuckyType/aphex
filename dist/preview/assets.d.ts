/** A resolved asset's renderable data. */
export interface ResolvedAsset {
    url: string;
    alt?: string;
    /**
     * Intrinsic dimensions of the original, so `<Image>` can set width/height and
     * reserve layout space before the image loads.
     */
    width?: number;
    height?: number;
    /**
     * Pre-built `srcset` of generated widths.
     *
     * Built here, on the server, rather than in the component: constructing a
     * variant URL needs the width ladder and the config hash, and the choice is
     * between shipping both to the browser or shipping the finished string. The
     * string is smaller, keeps the hashing in one place, and means the rule for
     * how a variant is addressed lives entirely server-side.
     *
     * Absent when the pipeline is disabled or the asset isn't an image, in which
     * case `<Image>` renders a plain `src` and behaves exactly as before.
     */
    srcset?: string;
}
/**
 * Collect every asset `_ref` reachable in a value. Image and file fields, and
 * portable-text image blocks, all carry `{ asset: { _ref } }`, so one generic walk
 * covers them — callers never enumerate field paths by hand.
 */
export declare function collectAssetRefs(value: unknown, acc?: Set<string>): Set<string>;
/**
 * Inject resolved `{ url, alt }` onto every `{ asset: { _ref } }` in a value, in place.
 * After this, `image.asset.url` / `image.asset.alt` are populated so the frontend reads
 * them directly. Mutates the value — pass a clone (e.g. `$state.snapshot`) if the input
 * must be preserved. Refs absent from `resolved` are left untouched.
 */
export declare function injectAssetData(value: unknown, resolved: ReadonlyMap<string, ResolvedAsset>): void;
//# sourceMappingURL=assets.d.ts.map
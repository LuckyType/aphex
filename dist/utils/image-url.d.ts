import type { ImageValue, ImageAsset, Asset } from '../types/asset.js';
export interface ImageUrlBuilderOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif';
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
    auto?: 'format';
}
export interface ImageUrlBuilderConfig {
    baseUrl?: string;
    /**
     * Function to sign asset URLs for secure, time-limited access
     * Used for multi-tenant access without exposing API keys
     */
    signAssetUrl?: (assetId: string) => string;
}
export declare class ImageUrlBuilder {
    private _source;
    private _options;
    /**
     * Set the image source
     */
    image(source: ImageValue | ImageAsset | string | Asset | null | undefined): this;
    /**
     * Request a rendered width in pixels.
     *
     * Snaps to the narrowest generated variant that covers it — the ladder is a
     * closed allowlist, so `width(333)` returns the 640px rung rather than a
     * 333px image. Asking for a width no variant covers returns the widest one.
     */
    width(width: number): this;
    /**
     * Request a rendered height in pixels.
     *
     * Honoured only as a *width* request: derivatives are resized by width and
     * keep the original's aspect ratio, so this converts through the asset's
     * intrinsic dimensions and then snaps like {@link width}. Without those
     * dimensions there's nothing to convert through and it's ignored.
     */
    height(height: number): this;
    /**
     * Set both dimensions. Width wins — see {@link height}; nothing crops.
     */
    size(width: number, height: number): this;
    /**
     * @deprecated No effect. Quality is a property of the pipeline, not the URL:
     * it's set once via `images.quality` and hashed into every variant filename,
     * which is what lets variants be cached immutably. A per-URL override would
     * mean generating and storing a second copy of every image per quality value
     * any caller ever passed.
     */
    quality(quality: number): this;
    /**
     * @deprecated No effect. Every derivative is WebP; the original is served in
     * whatever format it was uploaded as. Transcoding on request would reopen the
     * unbounded-generation hole the width allowlist exists to close.
     */
    format(format: 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif'): this;
    /**
     * @deprecated No effect. Derivatives are width-resized and preserve aspect
     * ratio, so there is no second dimension for a fit mode to act on. Per-preset
     * `fit`/`aspectRatio` is post-V1, and lands on top of focal points.
     */
    fit(fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'): this;
    /**
     * @deprecated No effect, and already the behaviour: variants are always WebP.
     */
    auto(mode: 'format'): this;
    /**
     * The requested width, converting a height request through the asset's own
     * aspect ratio.
     *
     * Width wins when both are set: a derivative is only ever resized by width,
     * so honouring a height as well would require cropping — which the V1
     * pipeline deliberately doesn't do.
     */
    private targetWidth;
    /** The ladder variant covering the requested size, if one can be resolved. */
    private snappedUrl;
    /**
     * Build the final URL.
     *
     * With a width (or a height that can be converted to one) and an injected
     * `srcset`, this returns the variant URL for the nearest covering rung.
     * Otherwise it returns the asset's own URL — the full-size original.
     *
     * **Prefer `<Image>` for anything rendered.** This returns one fixed URL, so
     * it can't respond to viewport or device pixel ratio; `<Image>` emits the
     * whole `srcset` and lets the browser choose. Reach for this when you need a
     * bare string and the size is genuinely fixed — an OG image, an email, a
     * canvas or PDF source.
     */
    url(): string | null;
    /**
     * Alias for url()
     */
    toString(): string | null;
}
/**
 * Factory for a Sanity-style image URL builder.
 *
 * ```ts
 * const urlFor = imageUrlBuilder();
 * urlFor(post.coverImage).width(800).url();  // → the 960px rung
 * urlFor(post.coverImage).url();             // → the original
 * ```
 *
 * `width` snaps to the nearest generated variant that covers it, read off the
 * `srcset` that `injectAssetUrls` attached — so the source must have been
 * through injection (any value from the Local API, a load function, or GraphQL
 * has been). Without a width, or without a srcset, you get the original.
 *
 * Takes no arguments. It previously documented a `baseUrl` and a `signAssetUrl`
 * hook, neither of which the function ever accepted — assets carry their own
 * urls, and `/media/:id/:filename` handles access control centrally rather than
 * through per-caller signing. Signed delivery is `config.signedDownloads`.
 *
 * `quality`, `format`, `fit` and `auto` remain on the builder for source
 * compatibility but are deprecated no-ops; see each one for why.
 */
export declare function imageUrlBuilder(): (source?: ImageValue | ImageAsset | string | Asset | null) => ImageUrlBuilder;
//# sourceMappingURL=image-url.d.ts.map
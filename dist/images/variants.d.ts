import type { Asset, AssetVariant, AssetVariantRecord } from '../types/asset.js';
/**
 * Reading and selecting image derivatives.
 *
 * Pure functions over an `Asset`, with no Sharp and no storage — so the
 * `<Image>` component can import them in the browser. Generation lives in
 * `./generate.ts`, which is server-only.
 */
/** The resolved image configuration a request is served under. */
export interface ImageConfig {
    widths: number[];
    quality: number;
}
export declare const DEFAULT_IMAGE_WIDTHS: number[];
export declare const DEFAULT_IMAGE_QUALITY = 80;
/**
 * Normalise the user's `images` config, or return null when disabled.
 *
 * Widths are de-duplicated and sorted so that two configs listing the same
 * widths in a different order hash identically — otherwise reordering the array
 * in `aphex.config.ts` would silently orphan every previously generated
 * derivative and regenerate the lot.
 */
export declare function resolveImageConfig(images: {
    widths: number[];
    quality?: number;
} | null | undefined): ImageConfig | null;
/** Hash identifying the config a derivative was generated under. */
export declare function configHashFor(config: ImageConfig): string;
/**
 * The variant record for an asset, or null when there isn't a usable one.
 *
 * Validates rather than asserts: `metadata` is JSON that has been through a
 * database and may predate this feature entirely, so a malformed or partial
 * record must read as "no variants" and be regenerated, never crash a page
 * render.
 */
export declare function getVariants(asset: Pick<Asset, 'metadata'>): AssetVariantRecord | null;
/**
 * The already-generated derivative for an exact width, under the current config.
 *
 * A record generated under a different config is ignored: every variant URL
 * embeds the config hash, so a stale record's URLs address files that are no
 * longer referenced by anything.
 */
export declare function pickVariant(asset: Pick<Asset, 'metadata'>, width: number, configHash: string): AssetVariant | null;
/**
 * The ladder widths worth offering for this asset.
 *
 * Widths at or above the original's own width are dropped — upscaling produces
 * a larger file that looks no better. The original's width is always included
 * as the top rung so a `srcset` still has something to offer above the last
 * useful ladder step.
 */
/**
 * Build a `srcset` for an asset, listing every ladder width worth offering.
 *
 * The URLs it names may not exist yet — that's the point of generate-on-miss.
 * The browser requests one, `/media` produces it on the spot, and every later
 * request for that width is a cache hit. So a `srcset` is correct the moment an
 * asset is uploaded, with no generation having happened at all.
 */
export declare function buildSrcset(assetId: string, config: ImageConfig, configHash: string, originalWidth: number | null): string;
/**
 * Whether derivatives can be produced for this asset at all.
 *
 * Lives here, next to the ladder, because two callers need the same answer: the
 * server building a `srcset` and the admin client picking a thumbnail. A second
 * copy of this rule would drift, and the failure is quiet — a thumbnail URL that
 * falls back to a 14MB original renders perfectly and costs a hundred times what
 * it should.
 */
export declare function canGenerateVariants(asset: Pick<Asset, 'assetType' | 'mimeType' | 'metadata'>): boolean;
/**
 * The smallest derivative worth requesting for a thumbnail.
 *
 * A grid tile is a couple of hundred pixels; the bottom rung of the ladder is
 * the right answer for it, and nothing about a tile justifies more.
 */
export declare function thumbnailWidth(config: ImageConfig, originalWidth: number | null): number;
export declare function usableWidths(config: ImageConfig, originalWidth: number | null): number[];
//# sourceMappingURL=variants.d.ts.map
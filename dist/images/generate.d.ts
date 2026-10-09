import type { Asset, AssetVariant } from '../types/asset.js';
import type { StorageAdapter } from '../storage/interfaces/storage.js';
import type { DatabaseAdapter } from '../db/interfaces/index.js';
import { type ImageConfig } from './variants.js';
/**
 * Set how many derivatives may be produced at once.
 *
 * Unlike the upload timeout, this earns being configurable: it encodes a real
 * decision — how much memory this deployment is willing to spend on image
 * processing — and the right answer genuinely differs between a 512MB VPS and a
 * 4GB function. Applied process-wide because the constraint is the process's
 * memory, not any one request's.
 */
export declare function setGenerationConcurrency(limit: number): void;
/** Thrown when the queue is saturated. The caller serves the original instead. */
export declare class GenerationBusyError extends Error {
    constructor();
}
/**
 * Thrown for a source whose animation would be destroyed by resizing.
 *
 * Sharp reads only the first frame unless told otherwise, so an animated GIF
 * run through this pipeline comes out as a single still — the image still
 * "works", which is what makes it dangerous: nothing errors, the animation is
 * just silently gone.
 *
 * Preserving it is possible (`animated: true` out to an animated WebP) and
 * deliberately not done here, because the memory cost is unbounded in the one
 * dimension nothing else caps: a decoded animation is frames × width × height ×
 * 4, so a couple of hundred frames at 800×600 is well over a gigabyte. That is
 * exactly the out-of-memory case the concurrency gate exists to prevent, and no
 * per-image pixel limit catches it. Animated sources are served as-is instead.
 */
export declare class AnimatedSourceError extends Error {
    constructor(pages: number);
}
export interface GeneratedVariant {
    variant: AssetVariant;
    buffer: Buffer;
}
/**
 * Produce (or await) the derivative of `asset` at `width`.
 *
 * Writes the variant to storage and records it on `asset.metadata.variants`
 * before resolving, so the next request is a cache hit.
 */
export declare function generateVariant(opts: {
    asset: Asset;
    width: number;
    config: ImageConfig;
    configHash: string;
    storage: StorageAdapter;
    database: DatabaseAdapter;
}): Promise<GeneratedVariant>;
//# sourceMappingURL=generate.d.ts.map
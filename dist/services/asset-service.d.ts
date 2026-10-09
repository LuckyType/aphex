import type { StorageAdapter } from '../storage/interfaces/storage.js';
import type { DatabaseAdapter } from '../db/interfaces/index.js';
import type { AssetFilters } from '../db/interfaces/asset.js';
import type { Asset } from '../types/index.js';
import { type ImageConfig } from '../images/variants.js';
export interface AssetUploadData {
    buffer: Buffer;
    originalFilename: string;
    mimeType: string;
    size: number;
    title?: string;
    description?: string;
    alt?: string;
    creditLine?: string;
    createdBy?: string;
    /**
     * Pixel dimensions supplied by the caller. Used only where this service cannot
     * derive them itself — video, whose container it has no decoder for. Ignored
     * for images, which are measured from the buffer.
     */
    width?: number;
    height?: number;
    metadata?: {
        schemaType?: string;
        fieldPath?: string;
        [key: string]: any;
    };
}
/**
 * Re-exported from the database port rather than declared again.
 *
 * There were two of these — this one and `AssetFilters` in
 * `db/interfaces/asset.ts` — with identical fields and no relationship. The
 * `/server` barrel exports *this* name, so it's the one every adapter imports,
 * while the port is what `findAssets` is actually typed against. Adding `sort`
 * to the port therefore compiled cleanly in core and failed in both adapters,
 * which is the mild version: the bad version is a field added to one copy and
 * silently dropped by every implementation typed against the other.
 */
export type { AssetFilters } from '../db/interfaces/asset.js';
/**
 * Asset service - coordinates storage and database operations
 * Maintains separation of concerns while providing unified asset management
 */
export declare class AssetService {
    private storage;
    private database;
    private images;
    private allowedMimeTypes;
    /**
     * `images` is optional so existing callers (and tests) keep working: without
     * it, injection produces `url`/`alt` exactly as before and `<Image>` falls
     * back to a plain `src`. The srcset is built here rather than in the
     * component because this is where the config lives — see
     * {@link ResolvedAsset.srcset}.
     */
    constructor(storage: StorageAdapter, database: DatabaseAdapter, images?: ImageConfig | null, allowedMimeTypes?: readonly string[]);
    /**
     * Upload and store an asset
     */
    uploadAsset(organizationId: string, data: AssetUploadData): Promise<Asset>;
    /**
     * Create the asset row for a file the browser uploaded straight to storage.
     *
     * The client writes to a temporary object. The asset row is claimed before
     * promotion so its unique id makes the ticket single-use even when two server
     * instances confirm it concurrently. Promotion or validation failure rolls
     * that claim back.
     *
     * Nothing the client says about the object is trusted. Its existence and
     * size are read back from storage, because a caller could otherwise claim a
     * 1KB upload, never perform it, or exceed the configured ceiling — the
     * signed URL bypasses `bodyLimit` entirely, so this is the only place the
     * limit can still be enforced.
     */
    finalizeDirectUpload(organizationId: string, intent: {
        assetId: string;
        key: string;
        finalKey: string;
        originalFilename: string;
        mimeType: string;
        schemaType?: string;
        fieldPath?: string;
    }, extras: {
        maxBytes: number;
        title?: string;
        description?: string;
        alt?: string;
        creditLine?: string;
        createdBy?: string;
        /**
         * Privacy resolved from the target field by the caller, which has the
         * schema this service does not. Stamped onto the asset so the answer
         * survives that field being renamed — see `utils/asset-privacy.ts`.
         */
        private?: boolean;
        /** Field-level rule, resolved by the route that owns the schema. */
        allowedMimeTypes?: string[];
    }): Promise<Asset>;
    /**
     * Confirm the object is really there and within the ceiling, returning its
     * true size. Deletes and rejects an oversized upload.
     */
    private verifyUploadedObject;
    /**
     * Find asset by ID
     */
    findAssetById(organizationId: string, id: string): Promise<Asset | null>;
    /**
     * Hydrate one or more documents in place so their images are renderable: every
     * `{ asset: { _ref } }` reachable in the docs gets its `url` (and default `alt`)
     * injected. This is what a public route's `load` calls before returning a document —
     * the frontend then reads `image.asset.url` directly, with no side-channel map. The
     * live editor preview performs the identical injection client-side, so SSR and preview
     * documents share one shape.
     *
     * Mutates the passed documents (they're request-scoped query results). Refs are
     * resolved once and de-duped across all docs in a single batch.
     */
    injectAssetUrls(organizationId: string, ...docs: unknown[]): Promise<void>;
    /**
     * Responsive `srcset` for an image, or undefined when there's nothing to offer.
     *
     * Non-images and SVGs are excluded: an SVG is already resolution-independent,
     * and rasterising one to a fixed ladder makes it strictly worse.
     */
    private buildSrcsetFor;
    /**
     * Find asset by ID globally (bypasses organization filter for public asset access)
     * Only available on PostgreSQL adapter with RLS bypass
     */
    findAssetByIdGlobal(id: string): Promise<Asset | null>;
    /**
     * Find multiple assets with filtering
     */
    findAssets(organizationId: string, filters?: AssetFilters): Promise<Asset[]>;
    /**
     * Delete asset (both file and database record)
     *
     * Note: If the asset was stored by a different adapter (e.g., switching from R2 to local),
     * file deletion may fail. The database record will still be removed for a clean state.
     */
    deleteAsset(organizationId: string, id: string): Promise<boolean>;
    /**
     * Remove an asset's original *and every derivative generated from it*.
     *
     * Deleting only `asset.path` leaks: each generated variant is a separate
     * object, and nothing else ever refers to it again. The leak is invisible —
     * no error, no broken image, just a bucket that grows and never shrinks.
     *
     * Two sources, unioned, because neither is sufficient alone:
     *
     * - **Prefix listing** is authoritative. Every derivative is a sibling of the
     *   original under `{assetId}/`, so one listing finds all of them —
     *   *including* ones generated under a config that has since changed, which
     *   the database has no record of at all (`recordVariant` replaces the record
     *   wholesale when the config hash moves). But `listObjects` is optional on
     *   the port, and the local adapter doesn't implement it.
     * - **The recorded variants** cover that gap, and cost nothing to read.
     *
     * Only assets stored under the id-directory layout get the prefix treatment.
     * An older flat-layout asset has a path unrelated to its id, so deriving a
     * prefix from the id would either match nothing or — much worse — match
     * something else.
     */
    private deleteAssetObjects;
    /**
     * Update asset metadata, including renaming it.
     *
     * `undefined` leaves a field untouched; `null` clears it. See
     * {@link UpdateAssetData}.
     *
     * Renaming is metadata-only. The stored object lives at
     * `{assetId}/original.{ext}`, derived from the id rather than the name, so
     * nothing moves in storage and existing `_ref`s keep resolving — the only
     * thing that changes is the cosmetic trailing segment of `url`, which this
     * method regenerates so the two can't drift.
     *
     * Assets stored under the old flat layout are renamed the same way: their
     * `path` still points at the original file, and only the display name and
     * URL move. The exception is a pre-`/media/` asset still carrying an absolute
     * bucket URL — that URL isn't ours to rewrite, so it's left alone.
     */
    updateAssetMetadata(organizationId: string, id: string, metadata: {
        originalFilename?: string;
        title?: string | null;
        description?: string | null;
        alt?: string | null;
        creditLine?: string | null;
        updatedBy?: string;
    }): Promise<Asset | null>;
    /**
     * Get asset statistics
     */
    getAssetStats(organizationId: string): Promise<{
        totalAssets: number;
        totalImages: number;
        totalFiles: number;
        totalSize: number;
    }>;
    /**
     * Get health status of both storage and database
     */
    getHealthStatus(): Promise<{
        storage: boolean;
        database: boolean;
    }>;
}
//# sourceMappingURL=asset-service.d.ts.map
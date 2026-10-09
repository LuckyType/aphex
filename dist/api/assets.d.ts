import { type UploadOptions } from './upload.js';
import type { ApiResponse } from './types.js';
import type { Asset } from '../types/asset.js';
import type { AssetDeleteConflict, BulkAssetDeleteConflict, AssetReference, ListAssetsQuery, UpdateAssetRequest } from './schemas/assets.js';
export type AssetFilters = ListAssetsQuery;
export type UpdateAssetData = UpdateAssetRequest;
export type { AssetReference, AssetDeleteConflict, BulkAssetDeleteConflict };
export declare class AssetsApi {
    /**
     * List assets with optional filters
     */
    /**
     * Attach a poster frame to an existing video.
     *
     * Separate from the upload because the frame's storage key derives from an
     * asset id that doesn't exist until the row does: upload the video, learn the
     * id, then send the frame here.
     */
    static uploadPoster(assetId: string, poster: Blob | undefined, info?: {
        duration?: number;
        width?: number;
        height?: number;
    }): Promise<ApiResponse<unknown>>;
    static list(filters?: ListAssetsQuery): Promise<ApiResponse<Asset[]>>;
    /**
     * Get asset by ID
     */
    static getById(id: string): Promise<ApiResponse<Asset>>;
    /**
     * Upload a file, choosing the transport.
     *
     * Direct-to-storage when the server reports it available, otherwise through
     * the app. The choice is the server's to report, not the client's to guess:
     * it depends on whether the adapter can sign, whether an encryption key is
     * configured, and whether the operator opted in — the last of which implies
     * bucket CORS that nothing here can detect.
     */
    static uploadFile(file: File, opts?: {
        direct?: boolean;
        schemaType?: string;
        fieldPath?: string;
        allowedMimeTypes?: string[];
        /** Read from the file in the browser; absent for non-video or an undecodable codec. */
        videoDuration?: number;
        videoWidth?: number;
        videoHeight?: number;
    } & UploadOptions): Promise<ApiResponse<Asset>>;
    /**
     * Three-step direct upload: get a signed URL, PUT to storage, confirm.
     *
     * Progress covers only the PUT — it is the whole transfer, and reporting the
     * two bookkeeping calls would just make the bar jump.
     */
    private static uploadDirect;
    /**
     * Upload a new asset (multipart/form-data)
     * Note: Use FormData for file uploads
     */
    static upload(formData: FormData, options?: UploadOptions): Promise<ApiResponse<Asset>>;
    /**
     * Update asset metadata
     */
    static update(id: string, data: UpdateAssetRequest): Promise<ApiResponse<Asset>>;
    /**
     * Delete an asset.
     *
     * Throws `ApiError` with status 409 and an {@link AssetDeleteConflict} body when
     * the asset is still referenced. Pass `{ force: true }` to delete anyway —
     * necessary when the reference is held by a document whose schema type is no
     * longer registered, since that document can't be opened to remove it by hand.
     */
    static delete(id: string, options?: {
        force?: boolean;
    }): Promise<ApiResponse<{
        success: boolean;
    }>>;
    /**
     * Bulk delete assets.
     *
     * Rejects with a 409 carrying {@link BulkAssetDeleteConflict} when any of them
     * is still referenced. `{ force: true }` deletes anyway — the same escape the
     * single-asset delete has, and for the same reason: a reference held by a
     * document whose schema type is no longer registered cannot be removed by
     * hand, so without it those assets are undeletable.
     */
    static deleteBulk(ids: string[], options?: {
        force?: boolean;
    }): Promise<ApiResponse<{
        deleted: number;
        failed: number;
    }>>;
    /**
     * Get documents that reference a specific asset
     */
    static getReferences(id: string): Promise<ApiResponse<{
        references: AssetReference[];
        total: number;
    }>>;
    /**
     * Get reference counts for multiple assets in batch
     */
    static getReferenceCounts(ids: string[]): Promise<ApiResponse<Record<string, number>>>;
}
export declare const assets: {
    list: typeof AssetsApi.list;
    uploadPoster: typeof AssetsApi.uploadPoster;
    getById: typeof AssetsApi.getById;
    upload: typeof AssetsApi.upload;
    uploadFile: typeof AssetsApi.uploadFile;
    update: typeof AssetsApi.update;
    delete: typeof AssetsApi.delete;
    deleteBulk: typeof AssetsApi.deleteBulk;
    getReferences: typeof AssetsApi.getReferences;
    getReferenceCounts: typeof AssetsApi.getReferenceCounts;
};
//# sourceMappingURL=assets.d.ts.map
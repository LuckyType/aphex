// Assets API client - manage uploaded files and images
import { apiClient, ApiError } from './client.js';
import { putToStorage, uploadFormData } from './upload.js';
import { uploadTimeoutFor, uploadTimeoutForBytes } from './upload-timeout.js';
import { effectiveFileType } from '../utils/file-accept.js';
export class AssetsApi {
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
    static async uploadPoster(assetId, 
    // Optional: audio has a duration worth storing and no frame to store.
    poster, info = {}) {
        const body = new FormData();
        if (poster)
            body.append('poster', new File([poster], 'poster.webp', { type: 'image/webp' }));
        // Sent with the frame because the browser reads them from the same
        // `loadedmetadata`; decoding a second time to fetch them would be waste.
        if (info.duration != null)
            body.append('duration', String(info.duration));
        if (info.width != null)
            body.append('width', String(info.width));
        if (info.height != null)
            body.append('height', String(info.height));
        return apiClient.post(`/assets/${assetId}/poster`, body);
    }
    static async list(filters) {
        return apiClient.get('/assets', filters);
    }
    /**
     * Get asset by ID
     */
    static async getById(id) {
        return apiClient.get(`/assets/${id}`);
    }
    /**
     * Upload a file, choosing the transport.
     *
     * Direct-to-storage when the server reports it available, otherwise through
     * the app. The choice is the server's to report, not the client's to guess:
     * it depends on whether the adapter can sign, whether an encryption key is
     * configured, and whether the operator opted in — the last of which implies
     * bucket CORS that nothing here can detect.
     */
    static async uploadFile(file, opts = {}) {
        const { direct, schemaType, fieldPath, allowedMimeTypes, videoDuration, videoWidth, videoHeight, ...uploadOptions } = opts;
        if (direct) {
            try {
                return await AssetsApi.uploadDirect(file, { schemaType, fieldPath }, uploadOptions);
            }
            catch (err) {
                // Only a missing endpoint justifies retrying the other way. A CORS
                // failure or a rejected signature must surface: silently proxying a
                // file the platform will refuse turns a fixable misconfiguration
                // into a confusing size error.
                if (!(err instanceof ApiError) || err.status !== 404)
                    throw err;
            }
        }
        const formData = new FormData();
        formData.append('file', file);
        if (schemaType)
            formData.append('schemaType', schemaType);
        if (fieldPath)
            formData.append('fieldPath', fieldPath);
        if (allowedMimeTypes?.length) {
            formData.append('allowedMimeTypes', JSON.stringify(allowedMimeTypes));
        }
        // Browser-read video facts. Claims, not proof — the server clamps them, since
        // nothing stops a caller posting a duration of a billion seconds.
        if (videoDuration != null)
            formData.append('videoDuration', String(videoDuration));
        if (videoWidth != null)
            formData.append('videoWidth', String(videoWidth));
        if (videoHeight != null)
            formData.append('videoHeight', String(videoHeight));
        return AssetsApi.upload(formData, uploadOptions);
    }
    /**
     * Three-step direct upload: get a signed URL, PUT to storage, confirm.
     *
     * Progress covers only the PUT — it is the whole transfer, and reporting the
     * two bookkeeping calls would just make the bar jump.
     */
    static async uploadDirect(file, meta, options) {
        const grant = (await apiClient.post('/assets/upload-url', {
            filename: file.name,
            mimeType: effectiveFileType(file.name, file.type) || 'application/octet-stream',
            size: file.size,
            ...meta
        })).data;
        if (!grant)
            throw new ApiError(500, null, 'Malformed upload grant');
        await putToStorage(grant.uploadUrl, file, grant.headers, {
            ...options,
            timeoutMs: options.timeoutMs ?? uploadTimeoutForBytes(file.size)
        });
        return apiClient.post('/assets/confirm', { assetId: grant.assetId }, { 'x-upload-ticket': grant.ticket });
    }
    /**
     * Upload a new asset (multipart/form-data)
     * Note: Use FormData for file uploads
     */
    static async upload(formData, options) {
        return uploadFormData('/api/assets', formData, {
            ...options,
            // Derived from the payload rather than configured: a fixed deadline
            // either aborts large uploads that were succeeding or waits far too
            // long on small ones that have genuinely died.
            timeoutMs: options?.timeoutMs ?? uploadTimeoutFor(formData)
        });
    }
    /**
     * Update asset metadata
     */
    static async update(id, data) {
        return apiClient.patch(`/assets/${id}`, data);
    }
    /**
     * Delete an asset.
     *
     * Throws `ApiError` with status 409 and an {@link AssetDeleteConflict} body when
     * the asset is still referenced. Pass `{ force: true }` to delete anyway —
     * necessary when the reference is held by a document whose schema type is no
     * longer registered, since that document can't be opened to remove it by hand.
     */
    static async delete(id, options) {
        const query = options?.force ? '?force=true' : '';
        return apiClient.delete(`/assets/${id}${query}`);
    }
    /**
     * Bulk delete assets.
     *
     * Rejects with a 409 carrying {@link BulkAssetDeleteConflict} when any of them
     * is still referenced. `{ force: true }` deletes anyway — the same escape the
     * single-asset delete has, and for the same reason: a reference held by a
     * document whose schema type is no longer registered cannot be removed by
     * hand, so without it those assets are undeletable.
     */
    static async deleteBulk(ids, options) {
        const query = options?.force ? '?force=true' : '';
        return apiClient.delete(`/assets/bulk${query}`, { ids });
    }
    /**
     * Get documents that reference a specific asset
     */
    static async getReferences(id) {
        return apiClient.get(`/assets/${id}/references`);
    }
    /**
     * Get reference counts for multiple assets in batch
     */
    static async getReferenceCounts(ids) {
        return apiClient.post('/assets/references/counts', { ids });
    }
}
// Export convenience functions for direct use
export const assets = {
    list: AssetsApi.list.bind(AssetsApi),
    uploadPoster: AssetsApi.uploadPoster.bind(AssetsApi),
    getById: AssetsApi.getById.bind(AssetsApi),
    upload: AssetsApi.upload.bind(AssetsApi),
    uploadFile: AssetsApi.uploadFile.bind(AssetsApi),
    update: AssetsApi.update.bind(AssetsApi),
    delete: AssetsApi.delete.bind(AssetsApi),
    deleteBulk: AssetsApi.deleteBulk.bind(AssetsApi),
    getReferences: AssetsApi.getReferences.bind(AssetsApi),
    getReferenceCounts: AssetsApi.getReferenceCounts.bind(AssetsApi)
};

// Documents API client - composable document operations
import { apiClient } from './client.js';
export class DocumentsApi {
    /**
     * List documents with optional filtering
     * NOTE: Requires 'type' parameter - use getByType() for convenience
     */
    static async list(params = {}) {
        const queryParams = {
            ...params,
            type: params.type || params.docType
        };
        delete queryParams.docType;
        return apiClient.get('/documents', queryParams);
    }
    /**
     * Get document by ID
     */
    static async getById(id) {
        return apiClient.get(`/documents/${id}`);
    }
    /**
     * Find all documents that reference the given document. Used by the
     * unpublish flow to warn the user that taking this doc down will leave
     * dangling references in the published perspective of any back-referrers.
     */
    static async getBackReferences(id) {
        return apiClient.get(`/documents/${id}/back-references`);
    }
    /**
     * Batch fetch — one HTTP call per N IDs. Server fans out and returns the
     * docs that exist (missing/forbidden IDs are silently dropped). Use this
     * when you have a known set of references to hydrate; for filtered or
     * paginated lists use `list()`.
     */
    static async getMany(ids) {
        if (ids.length === 0)
            return { success: true, data: [] };
        return apiClient.get('/documents/by-ids', { ids: ids.join(',') });
    }
    /**
     * Create new document
     */
    static async create(data) {
        return apiClient.post('/documents', data);
    }
    /**
     * Update document draft by ID (auto-save)
     * Request/response shapes come from the zod schema in ./schemas/documents.ts —
     * single source of truth shared with the server handler.
     */
    static async updateById(id, data) {
        return apiClient.put(`/documents/${id}`, data);
    }
    /**
     * Discard the draft: write what is published back as the draft.
     */
    static async discardDraft(id, options) {
        return apiClient.post(`/documents/${id}/discard-draft`, options);
    }
    /**
     * Publish document (copy draft -> published)
     */
    static async publish(id, options) {
        return apiClient.post(`/documents/${id}/publish`, options);
    }
    /**
     * Unpublish document (revert to draft only)
     */
    static async unpublish(id, options) {
        return apiClient.delete(`/documents/${id}/publish`, options);
    }
    /**
     * Schedule a publish/unpublish for a future time (ISO-8601 `runAt`).
     * Enqueues a job the worker runs at that time — the permission check happens now.
     */
    static async schedule(id, body) {
        return apiClient.post(`/documents/${id}/schedule`, body);
    }
    /** Pending scheduled publish/unpublish for a document (for the editor's schedule indicator). */
    static async getSchedule(id) {
        return apiClient.get(`/documents/${id}/schedule`);
    }
    /** Cancel the pending schedule for a document. */
    static async cancelSchedule(id) {
        return apiClient.delete(`/documents/${id}/schedule`);
    }
    /**
     * Delete document by ID
     */
    static async deleteById(id) {
        return apiClient.delete(`/documents/${id}`);
    }
    /**
     * Get documents by type (convenience method)
     */
    static async getByType(docType, params = {}) {
        return this.list({ ...params, docType });
    }
    /**
     * Get published documents only (convenience method)
     */
    static async getPublished(params = {}) {
        return this.list({ ...params, status: 'published' });
    }
    /**
     * Get draft documents only (convenience method)
     */
    static async getDrafts(params = {}) {
        return this.list({ ...params, status: 'draft' });
    }
    /**
     * List document version history
     */
    static async listVersions(id, params) {
        return apiClient.get(`/documents/${id}/versions`, params);
    }
    /**
     * Get a specific version
     */
    static async getVersion(id, versionNumber) {
        return apiClient.get(`/documents/${id}/versions/${versionNumber}`);
    }
    /**
     * Restore a version to draft
     */
    static async restoreVersion(id, versionNumber, options) {
        return apiClient.post(`/documents/${id}/versions/${versionNumber}/restore`, options);
    }
}
// Export convenience functions for direct use
export const documents = {
    list: DocumentsApi.list.bind(DocumentsApi),
    getById: DocumentsApi.getById.bind(DocumentsApi),
    getMany: DocumentsApi.getMany.bind(DocumentsApi),
    getBackReferences: DocumentsApi.getBackReferences.bind(DocumentsApi),
    create: DocumentsApi.create.bind(DocumentsApi),
    updateById: DocumentsApi.updateById.bind(DocumentsApi),
    publish: DocumentsApi.publish.bind(DocumentsApi),
    discardDraft: DocumentsApi.discardDraft.bind(DocumentsApi),
    unpublish: DocumentsApi.unpublish.bind(DocumentsApi),
    schedule: DocumentsApi.schedule.bind(DocumentsApi),
    getSchedule: DocumentsApi.getSchedule.bind(DocumentsApi),
    cancelSchedule: DocumentsApi.cancelSchedule.bind(DocumentsApi),
    deleteById: DocumentsApi.deleteById.bind(DocumentsApi),
    getByType: DocumentsApi.getByType.bind(DocumentsApi),
    getPublished: DocumentsApi.getPublished.bind(DocumentsApi),
    getDrafts: DocumentsApi.getDrafts.bind(DocumentsApi),
    listVersions: DocumentsApi.listVersions.bind(DocumentsApi),
    getVersion: DocumentsApi.getVersion.bind(DocumentsApi),
    restoreVersion: DocumentsApi.restoreVersion.bind(DocumentsApi)
};

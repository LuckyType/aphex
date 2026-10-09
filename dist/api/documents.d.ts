import type { ApiResponse } from './types.js';
import type { DocumentDTO, ListDocumentsQuery, CreateDocumentRequest, UpdateDocumentRequest, DocumentVersion, ListVersionsQuery } from './schemas/documents.js';
/** Shared CAS-guard option accepted by publish/unpublish/restore. */
export interface RevisionGuardOptions {
    /** The revision last read from `_meta.revision`. Omit to skip the check. */
    expectedRevision?: number;
}
export type DocumentListParams = ListDocumentsQuery;
export declare class DocumentsApi {
    /**
     * List documents with optional filtering
     * NOTE: Requires 'type' parameter - use getByType() for convenience
     */
    static list(params?: ListDocumentsQuery): Promise<ApiResponse<DocumentDTO[]>>;
    /**
     * Get document by ID
     */
    static getById(id: string): Promise<ApiResponse<DocumentDTO>>;
    /**
     * Find all documents that reference the given document. Used by the
     * unpublish flow to warn the user that taking this doc down will leave
     * dangling references in the published perspective of any back-referrers.
     */
    static getBackReferences(id: string): Promise<ApiResponse<Array<{
        id: string;
        type: string;
        status: string | null;
    }>>>;
    /**
     * Batch fetch — one HTTP call per N IDs. Server fans out and returns the
     * docs that exist (missing/forbidden IDs are silently dropped). Use this
     * when you have a known set of references to hydrate; for filtered or
     * paginated lists use `list()`.
     */
    static getMany(ids: string[]): Promise<ApiResponse<DocumentDTO[]>>;
    /**
     * Create new document
     */
    static create(data: CreateDocumentRequest): Promise<ApiResponse<DocumentDTO>>;
    /**
     * Update document draft by ID (auto-save)
     * Request/response shapes come from the zod schema in ./schemas/documents.ts —
     * single source of truth shared with the server handler.
     */
    static updateById(id: string, data: UpdateDocumentRequest): Promise<ApiResponse<DocumentDTO>>;
    /**
     * Discard the draft: write what is published back as the draft.
     */
    static discardDraft(id: string, options?: RevisionGuardOptions): Promise<ApiResponse<DocumentDTO>>;
    /**
     * Publish document (copy draft -> published)
     */
    static publish(id: string, options?: RevisionGuardOptions): Promise<ApiResponse<DocumentDTO>>;
    /**
     * Unpublish document (revert to draft only)
     */
    static unpublish(id: string, options?: RevisionGuardOptions): Promise<ApiResponse<DocumentDTO>>;
    /**
     * Schedule a publish/unpublish for a future time (ISO-8601 `runAt`).
     * Enqueues a job the worker runs at that time — the permission check happens now.
     */
    static schedule(id: string, body: {
        action: 'publish' | 'unpublish';
        runAt: string;
    }): Promise<ApiResponse<{
        jobId: string;
        type: string;
        runAt: string;
        status: string;
    }>>;
    /** Pending scheduled publish/unpublish for a document (for the editor's schedule indicator). */
    static getSchedule(id: string): Promise<ApiResponse<Array<{
        jobId: string;
        type: string;
        runAt: string;
        status: string;
        createdAt: string;
    }>>>;
    /** Cancel the pending schedule for a document. */
    static cancelSchedule(id: string): Promise<ApiResponse<{
        cancelled: number;
    }>>;
    /**
     * Delete document by ID
     */
    static deleteById(id: string): Promise<ApiResponse<void>>;
    /**
     * Get documents by type (convenience method)
     */
    static getByType(docType: string, params?: Omit<ListDocumentsQuery, 'docType'>): Promise<ApiResponse<DocumentDTO[]>>;
    /**
     * Get published documents only (convenience method)
     */
    static getPublished(params?: Omit<ListDocumentsQuery, 'status'>): Promise<ApiResponse<DocumentDTO[]>>;
    /**
     * Get draft documents only (convenience method)
     */
    static getDrafts(params?: Omit<ListDocumentsQuery, 'status'>): Promise<ApiResponse<DocumentDTO[]>>;
    /**
     * List document version history
     */
    static listVersions(id: string, params?: ListVersionsQuery): Promise<ApiResponse<DocumentVersion[]>>;
    /**
     * Get a specific version
     */
    static getVersion(id: string, versionNumber: number): Promise<ApiResponse<DocumentVersion>>;
    /**
     * Restore a version to draft
     */
    static restoreVersion(id: string, versionNumber: number, options?: RevisionGuardOptions): Promise<ApiResponse<DocumentDTO>>;
}
export declare const documents: {
    list: typeof DocumentsApi.list;
    getById: typeof DocumentsApi.getById;
    getMany: typeof DocumentsApi.getMany;
    getBackReferences: typeof DocumentsApi.getBackReferences;
    create: typeof DocumentsApi.create;
    updateById: typeof DocumentsApi.updateById;
    publish: typeof DocumentsApi.publish;
    discardDraft: typeof DocumentsApi.discardDraft;
    unpublish: typeof DocumentsApi.unpublish;
    schedule: typeof DocumentsApi.schedule;
    getSchedule: typeof DocumentsApi.getSchedule;
    cancelSchedule: typeof DocumentsApi.cancelSchedule;
    deleteById: typeof DocumentsApi.deleteById;
    getByType: typeof DocumentsApi.getByType;
    getPublished: typeof DocumentsApi.getPublished;
    getDrafts: typeof DocumentsApi.getDrafts;
    listVersions: typeof DocumentsApi.listVersions;
    getVersion: typeof DocumentsApi.getVersion;
    restoreVersion: typeof DocumentsApi.restoreVersion;
};
//# sourceMappingURL=documents.d.ts.map
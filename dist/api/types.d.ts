import type { Document, NewDocument } from '../types/index.js';
export interface PaginationMeta {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    pagination?: PaginationMeta;
    /**
     * Server-side limits the client should respect, reported by endpoints whose
     * clients need to pre-check against them. Present on `GET /assets` so the
     * media browser can refuse an oversized file without hardcoding a size that
     * drifts from whatever the server actually enforces.
     */
    limits?: {
        maxUploadBytes?: number;
        /** Installation-wide MIME types accepted for new uploads. */
        allowedMimeTypes?: string[];
        /** Whether the browser may upload straight to storage. */
        directUpload?: boolean;
    };
    /**
     * The resolved image pipeline, or null when it's off.
     *
     * Reported so the media browser can address a small derivative instead of
     * the original. `configHash` comes from the server rather than being
     * recomputed here: it is the server that decides which files exist, and a
     * client that derived a different hash would request URLs that quietly fall
     * back to the original — the exact bug this exists to fix, but silent.
     */
    images?: {
        widths: number[];
        quality: number;
        configHash: string;
    } | null;
    meta?: {
        count: number;
        limit: number;
        offset: number;
        filters: Record<string, any>;
    };
}
export interface DocumentListParams {
    type?: string;
    docType?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    limit?: number;
    offset?: number;
    depth?: number;
    sort?: string | string[];
    perspective?: 'draft' | 'published';
    includeChildOrganizations?: boolean;
    filterOrganizationIds?: string[];
}
export interface CreateDocumentData {
    type: string;
    data: Record<string, any>;
    publish?: boolean;
}
export interface UpdateDocumentData {
    data: Record<string, any>;
    publish?: boolean;
}
export type { Document, NewDocument };
//# sourceMappingURL=types.d.ts.map
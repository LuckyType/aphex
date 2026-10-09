import type { DatabaseAdapter } from '../db/index.js';
import type { Document } from '../types/document.js';
import type { DocumentVersion, DocumentVersionList } from '../types/version.js';
/**
 * VersionService — orchestrates document versioning with rolling retention.
 *
 * Stateless regarding the adapter — each method receives the adapter to use.
 * This allows CollectionAPI to pass whichever adapter is active (user or system),
 * ensuring proper RLS context propagation.
 */
export declare class VersionService {
    private maxVersions;
    constructor(options?: {
        maxVersions?: number;
    });
    /**
     * Create a version snapshot and enforce rolling retention.
     */
    createVersion(db: DatabaseAdapter, organizationId: string, documentId: string, eventType: 'draft' | 'publish', data: any, userId?: string | null): Promise<DocumentVersion | null>;
    /**
     * Write a version snapshot on an already-transactional adapter. The caller owns
     * the transaction boundary and retention (call `enforceRetentionFor` post-commit).
     * No-op when the adapter has no versioning support.
     */
    snapshotTx(tx: DatabaseAdapter, organizationId: string, documentId: string, eventType: 'draft' | 'publish', data: any, userId?: string | null): Promise<void>;
    /**
     * Publish + snapshot on an already-transactional adapter. Caller owns the tx
     * and retention. Returns the published document (or null if publish was a no-op).
     */
    publishTx(tx: DatabaseAdapter, organizationId: string, documentId: string, expectedRevision?: number): Promise<Document | null>;
    /**
     * Public retention trigger for callers that manage their own transaction and
     * therefore can't rely on `saveWithVersion`/`publishWithVersion` to run it.
     */
    enforceRetentionFor(db: DatabaseAdapter, organizationId: string, documentId: string): Promise<void>;
    /**
     * Save draft and create version atomically using adapter transaction.
     *
     * `alsoInTx` runs against the same handle once the write has succeeded, for
     * work that must commit with the document — the reference indexes. It exists
     * because this method owns the transaction: a caller that wrapped its own
     * around this one would be nesting `withTransaction`, which is not something
     * every adapter promises. Handing the inside out is the honest version.
     *
     * Skipped when the write returns null (nothing was updated), and its failure
     * rolls the document write back with it — which is the entire point.
     */
    saveWithVersion(db: DatabaseAdapter, organizationId: string, documentId: string, data: any, userId?: string, expectedRevision?: number, alsoInTx?: (tx: DatabaseAdapter, document: Document) => Promise<void>): Promise<Document | null>;
    /**
     * Publish and create version.
     */
    publishWithVersion(db: DatabaseAdapter, organizationId: string, documentId: string, expectedRevision?: number): Promise<Document | null>;
    /**
     * Restore a version to draft. Creates a 'draft' version entry.
     */
    restoreVersion(db: DatabaseAdapter, organizationId: string, documentId: string, versionNumber: number, userId?: string, expectedRevision?: number): Promise<Document | null>;
    listVersions(db: DatabaseAdapter, organizationId: string, documentId: string, options?: {
        limit?: number;
        offset?: number;
    }): Promise<DocumentVersionList>;
    getVersion(db: DatabaseAdapter, organizationId: string, documentId: string, versionNumber: number): Promise<DocumentVersion | null>;
    private enforceRetention;
}
//# sourceMappingURL=version-service.d.ts.map
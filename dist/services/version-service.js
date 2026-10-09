import { emitDocumentPublished } from '../events/emit.js';
import { syncDocumentAssetReferences } from './asset-references-service.js';
/**
 * VersionService — orchestrates document versioning with rolling retention.
 *
 * Stateless regarding the adapter — each method receives the adapter to use.
 * This allows CollectionAPI to pass whichever adapter is active (user or system),
 * ensuring proper RLS context propagation.
 */
export class VersionService {
    maxVersions;
    constructor(options) {
        this.maxVersions = options?.maxVersions ?? 25;
    }
    /**
     * Create a version snapshot and enforce rolling retention.
     */
    async createVersion(db, organizationId, documentId, eventType, data, userId) {
        if (!db.createDocumentVersion)
            return null;
        const version = await db.createDocumentVersion({
            documentId,
            organizationId,
            eventType,
            data,
            createdBy: userId
        });
        await this.enforceRetention(db, documentId, organizationId);
        return version;
    }
    /**
     * Write a version snapshot on an already-transactional adapter. The caller owns
     * the transaction boundary and retention (call `enforceRetentionFor` post-commit).
     * No-op when the adapter has no versioning support.
     */
    async snapshotTx(tx, organizationId, documentId, eventType, data, userId) {
        if (!tx.createDocumentVersion)
            return;
        await tx.createDocumentVersion({
            documentId,
            organizationId,
            eventType,
            data,
            createdBy: userId
        });
    }
    /**
     * Publish + snapshot on an already-transactional adapter. Caller owns the tx
     * and retention. Returns the published document (or null if publish was a no-op).
     */
    async publishTx(tx, organizationId, documentId, expectedRevision) {
        const result = await tx.publishDoc(organizationId, documentId, expectedRevision);
        if (result) {
            await this.snapshotTx(tx, organizationId, documentId, 'publish', result.publishedData, result.updatedBy);
            // Transactional outbox: record the durable fact in the same tx as the publish, so
            // the event and the state change commit (or roll back) together — a consumer can
            // never see a publish that didn't happen, nor miss one that did. The non-versioned
            // publish path (collection-api) emits the same event via the same helper.
            await emitDocumentPublished(tx, organizationId, result);
            await syncDocumentAssetReferences(tx, organizationId, result);
        }
        return result;
    }
    /**
     * Public retention trigger for callers that manage their own transaction and
     * therefore can't rely on `saveWithVersion`/`publishWithVersion` to run it.
     */
    async enforceRetentionFor(db, organizationId, documentId) {
        await this.enforceRetention(db, documentId, organizationId);
    }
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
    async saveWithVersion(db, organizationId, documentId, data, userId, expectedRevision, alsoInTx) {
        // No versioning support: a single write, which still needs the index to
        // land with it, so it gets a transaction of its own rather than staying a
        // bare update.
        if (!db.createDocumentVersion) {
            if (!alsoInTx) {
                return db.updateDocDraft(organizationId, documentId, data, userId, expectedRevision);
            }
            return db.withTransaction(async (txAdapter) => {
                const result = await txAdapter.updateDocDraft(organizationId, documentId, data, userId, expectedRevision);
                if (result)
                    await alsoInTx(txAdapter, result);
                return result;
            });
        }
        // RevisionConflictError propagates out of the transaction un-swallowed —
        // callers must surface it distinctly from a validation error.
        const updated = await db.withTransaction(async (txAdapter) => {
            const result = await txAdapter.updateDocDraft(organizationId, documentId, data, userId, expectedRevision);
            if (result) {
                await this.snapshotTx(txAdapter, organizationId, documentId, 'draft', data, userId);
                if (alsoInTx)
                    await alsoInTx(txAdapter, result);
            }
            return result;
        });
        if (updated)
            await this.enforceRetention(db, documentId, organizationId);
        return updated;
    }
    /**
     * Publish and create version.
     */
    async publishWithVersion(db, organizationId, documentId, expectedRevision) {
        // Publish + version snapshot must commit together: a crash between them
        // would leave a published document with no 'publish' version row. Mirror
        // saveWithVersion / restoreVersion and run both writes in one transaction.
        // No versioning support: no snapshot to write.
        if (!db.createDocumentVersion) {
            // A transaction of its own, so the asset rows commit with it.
            return db.withTransaction(async (txAdapter) => {
                const result = await txAdapter.publishDoc(organizationId, documentId, expectedRevision);
                if (result)
                    await syncDocumentAssetReferences(txAdapter, organizationId, result);
                return result;
            });
        }
        const published = await db.withTransaction((txAdapter) => this.publishTx(txAdapter, organizationId, documentId, expectedRevision));
        if (published)
            await this.enforceRetention(db, documentId, organizationId);
        return published;
    }
    /**
     * Restore a version to draft. Creates a 'draft' version entry.
     */
    async restoreVersion(db, organizationId, documentId, versionNumber, userId, expectedRevision) {
        if (!db.getDocumentVersion)
            return null;
        const version = await db.getDocumentVersion(organizationId, documentId, versionNumber);
        if (!version)
            return null;
        // A restore is itself a draft write — just as capable of clobbering a
        // concurrent edit as a normal save, so it goes through the same CAS guard.
        // No versioning support: no snapshot to write.
        if (!db.createDocumentVersion) {
            // A transaction of its own, so the asset rows commit with it.
            return db.withTransaction(async (txAdapter) => {
                const result = await txAdapter.updateDocDraft(organizationId, documentId, version.data, userId, expectedRevision);
                if (result)
                    await syncDocumentAssetReferences(txAdapter, organizationId, result);
                return result;
            });
        }
        const restored = await db.withTransaction(async (txAdapter) => {
            const result = await txAdapter.updateDocDraft(organizationId, documentId, version.data, userId, expectedRevision);
            if (result) {
                await this.snapshotTx(txAdapter, organizationId, documentId, 'draft', version.data, userId);
                await syncDocumentAssetReferences(txAdapter, organizationId, result);
            }
            return result;
        });
        if (restored)
            await this.enforceRetention(db, documentId, organizationId);
        return restored;
    }
    async listVersions(db, organizationId, documentId, options) {
        if (!db.listDocumentVersions)
            return { versions: [], total: 0 };
        return db.listDocumentVersions(organizationId, documentId, options);
    }
    async getVersion(db, organizationId, documentId, versionNumber) {
        if (!db.getDocumentVersion)
            return null;
        return db.getDocumentVersion(organizationId, documentId, versionNumber);
    }
    async enforceRetention(db, documentId, organizationId) {
        if (this.maxVersions <= 0)
            return;
        if (!db.listDocumentVersions || !db.deleteDocumentVersions)
            return;
        const { total, versions } = await db.listDocumentVersions(organizationId, documentId, {
            limit: 1000,
            offset: 0
        });
        if (total <= this.maxVersions)
            return;
        const toDelete = versions.slice(this.maxVersions);
        if (toDelete.length > 0) {
            await db.deleteDocumentVersions(documentId, toDelete.map((v) => v.id));
        }
    }
}

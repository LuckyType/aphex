import { documentPublished, userDeleted } from './catalog.js';
/**
 * Emit `document.published` (and its outbox row) for a freshly published document. MUST be
 * called on a TRANSACTION handle (from `withTransaction`) so the event commits atomically with
 * the publish it describes — the transactional-outbox guarantee. Shared by every publish path,
 * versioned and non-versioned alike, so the fact fires whenever a publish happens regardless of
 * whether a version snapshot was taken.
 */
export async function emitDocumentPublished(tx, organizationId, doc) {
    await tx.appendEvent({
        organizationId,
        type: documentPublished.type,
        payload: documentPublished.parse({
            documentId: doc.id,
            documentType: doc.type,
            publishedHash: doc.publishedHash ?? null
        }),
        createdBy: doc.updatedBy
    });
}
/**
 * Emit `user.deleted` once per organization the user belonged to.
 *
 * Fans out per-org because the event log is org-scoped and erasure is an org-level
 * concern: each organization holds its own residue of a user (their avatar, and in time
 * whatever else), and each consumer runs against the org it was delivered for. One event
 * naming a single "home" org would leave the others untouched.
 *
 * MUST be called on a TRANSACTION handle, in the same transaction as the deletion itself
 * — the transactional-outbox guarantee. An account erased without its events emitted is
 * personal data stranded with nothing left to point at it, which is the exact failure this
 * exists to prevent.
 *
 * `organizationIds` are the caller's — read them *before* the deletion removes the
 * membership rows, or this fans out to nothing.
 */
export async function emitUserDeleted(tx, organizationIds, user) {
    const payload = userDeleted.parse({
        userId: user.id,
        email: user.email ?? null,
        image: user.image ?? null
    });
    for (const organizationId of organizationIds) {
        await tx.appendEvent({
            organizationId,
            type: userDeleted.type,
            payload,
            createdBy: user.id
        });
    }
}

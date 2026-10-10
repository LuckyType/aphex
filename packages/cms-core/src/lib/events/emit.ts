// Shared emit helpers for built-in domain events. Kept in one place so the event's payload
// shape has a single source of truth and every publish path emits an identical fact — the
// event is a property of *publishing*, not of any one code path that happens to publish.
import type { DatabaseAdapter } from '../db/interfaces/index';
import type { Document } from '../types/document';
import {
	documentCreated,
	documentDeleted,
	documentDraftSaved,
	documentPublished,
	documentUnpublished,
	userDeleted
} from './catalog';

/**
 * Emit `document.published` (and its outbox row) for a freshly published document. MUST be
 * called on a TRANSACTION handle (from `withTransaction`) so the event commits atomically with
 * the publish it describes — the transactional-outbox guarantee. Shared by every publish path,
 * versioned and non-versioned alike, so the fact fires whenever a publish happens regardless of
 * whether a version snapshot was taken. `actorId` names who published; it defaults to the
 * document's last editor when the caller has no user of its own.
 */
export async function emitDocumentPublished(
	tx: DatabaseAdapter,
	organizationId: string,
	doc: Document,
	actorId?: string | null
): Promise<void> {
	await tx.appendEvent({
		organizationId,
		type: documentPublished.type,
		payload: documentPublished.parse({
			documentId: doc.id,
			documentType: doc.type,
			publishedHash: doc.publishedHash ?? null
		}),
		// `actorId` is who performed the publish (the caller, or the person a scheduled
		// job runs for). Without it the fact falls back to the document's last editor,
		// which is only right when the editor is also the publisher.
		createdBy: actorId ?? doc.updatedBy
	});
}

/**
 * The other document lifecycle facts, each with the same contract as
 * {@link emitDocumentPublished}: called on a TRANSACTION handle, in the same
 * transaction as the change it describes, so a consumer (an audit trail, a
 * cache, a search index) sees every write and never one that rolled back.
 * `actorId` is the caller; it falls back to the document's last editor.
 */
export async function emitDocumentCreated(
	tx: DatabaseAdapter,
	organizationId: string,
	doc: Document,
	actorId?: string | null
): Promise<void> {
	await tx.appendEvent({
		organizationId,
		type: documentCreated.type,
		payload: documentCreated.parse({ documentId: doc.id, documentType: doc.type }),
		createdBy: actorId ?? doc.updatedBy ?? doc.createdBy
	});
}

export async function emitDocumentDraftSaved(
	tx: DatabaseAdapter,
	organizationId: string,
	doc: Document,
	actorId?: string | null
): Promise<void> {
	await tx.appendEvent({
		organizationId,
		type: documentDraftSaved.type,
		payload: documentDraftSaved.parse({
			documentId: doc.id,
			documentType: doc.type,
			revision: typeof doc.revision === 'number' ? doc.revision : null
		}),
		createdBy: actorId ?? doc.updatedBy
	});
}

export async function emitDocumentUnpublished(
	tx: DatabaseAdapter,
	organizationId: string,
	doc: Document,
	actorId?: string | null
): Promise<void> {
	await tx.appendEvent({
		organizationId,
		type: documentUnpublished.type,
		payload: documentUnpublished.parse({ documentId: doc.id, documentType: doc.type }),
		createdBy: actorId ?? doc.updatedBy
	});
}

export async function emitDocumentDeleted(
	tx: DatabaseAdapter,
	organizationId: string,
	doc: Pick<Document, 'id' | 'type' | 'updatedBy'>,
	actorId?: string | null
): Promise<void> {
	await tx.appendEvent({
		organizationId,
		type: documentDeleted.type,
		payload: documentDeleted.parse({ documentId: doc.id, documentType: doc.type }),
		createdBy: actorId ?? doc.updatedBy
	});
}

/** A user account at the moment it is deleted — the last chance to read these fields. */
export interface DeletedUser {
	id: string;
	email?: string | null;
	image?: string | null;
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
export async function emitUserDeleted(
	tx: DatabaseAdapter,
	organizationIds: readonly string[],
	user: DeletedUser
): Promise<void> {
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

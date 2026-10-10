import { z } from 'zod';
import { defineEvent } from './define-event';

// Built-in event catalog. The payload carries identifiers + intentional metadata only —
// never secrets or full document copies (the log is not a content mirror). `organizationId`
// and `createdBy` are columns on the row, so they're not repeated in the payload.

/** Emitted after a document's draft is copied to published, inside the publish transaction. */
export const documentPublished = defineEvent(
	'document.published',
	z.object({
		documentId: z.string(),
		documentType: z.string(),
		publishedHash: z.string().nullable()
	})
);

/** The identifiers every document lifecycle event carries. */
const documentRef = z.object({
	documentId: z.string(),
	documentType: z.string()
});

/** Emitted when a document row is created, inside the creating transaction. */
export const documentCreated = defineEvent('document.created', documentRef);

/**
 * Emitted on every draft write, inside the writing transaction: an editor's
 * autosave, a Local API update, a version restore. `revision` is the draft
 * revision after the write, so a consumer can order saves and spot a gap.
 */
export const documentDraftSaved = defineEvent(
	'document.draft_saved',
	documentRef.extend({ revision: z.number().nullable() })
);

/** Emitted when the published copy is withdrawn, inside the unpublish transaction. */
export const documentUnpublished = defineEvent('document.unpublished', documentRef);

/** Emitted when a document row is deleted, inside the deleting transaction. */
export const documentDeleted = defineEvent('document.deleted', documentRef);

/**
 * Emitted when a user account is deleted, once per organization they belonged to — the
 * erasure fan-out point. Consumers react by removing whatever that user left behind in
 * *their* organization, so "delete my account" reaches per-org data without the deletion
 * path having to know every consumer that cares.
 *
 * Carries `image` because it can't be looked up afterwards: the account row is gone by the
 * time a consumer runs, taking the only pointer to the avatar asset with it. This is the
 * one case where the payload holds a value rather than an identifier, and it's still not a
 * secret — it's the same public CDN path the profile served.
 */
export const userDeleted = defineEvent(
	'user.deleted',
	z.object({
		userId: z.string(),
		email: z.string().nullable(),
		/** The profile image as stored, or null. `/media/<assetId>/<filename>` when it's ours. */
		image: z.string().nullable()
	})
);

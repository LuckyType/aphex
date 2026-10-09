import { z } from 'zod';
/** Emitted after a document's draft is copied to published, inside the publish transaction. */
export declare const documentPublished: import("./define-event.js").EventDefinition<"document.published", z.ZodObject<{
    documentId: z.ZodString;
    documentType: z.ZodString;
    publishedHash: z.ZodNullable<z.ZodString>;
}, z.core.$strip>>;
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
export declare const userDeleted: import("./define-event.js").EventDefinition<"user.deleted", z.ZodObject<{
    userId: z.ZodString;
    email: z.ZodNullable<z.ZodString>;
    image: z.ZodNullable<z.ZodString>;
}, z.core.$strip>>;
//# sourceMappingURL=catalog.d.ts.map
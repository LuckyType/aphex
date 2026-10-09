import { z } from 'zod';
import type { LocalAPI } from '../local-api/index.js';
import type { JobHandlerMap } from './types.js';
/** Reserved built-in job types. Scheduling uses these; the worker maps them to the handlers below. */
export declare const DOCUMENT_PUBLISH_JOB = "document.publish";
export declare const DOCUMENT_UNPUBLISH_JOB = "document.unpublish";
/** Payload for document.publish / document.unpublish jobs — identifiers only, never content. */
export declare const documentJobPayload: z.ZodObject<{
    documentId: z.ZodString;
    documentType: z.ZodString;
}, z.core.$strip>;
export type DocumentJobPayload = z.infer<typeof documentJobPayload>;
export interface DocumentJobDeps {
    localAPI: LocalAPI;
}
/**
 * Built-in handlers for scheduled publish/unpublish.
 *
 * Runs as the system (override access) — the permission check already happened when the
 * job was scheduled. Publish routes through `CollectionAPI.publish`, so it re-runs
 * validation + reference guards + cache invalidation and emits `document.published`
 * inside the publish transaction, exactly like a manual publish. A handler throw is a
 * job failure: the runner retries with backoff or dead-letters it (e.g. a doc whose
 * references became unpublished before the scheduled time fails validation and retries).
 */
export declare function createDocumentJobHandlers(deps: DocumentJobDeps): JobHandlerMap;
//# sourceMappingURL=document-jobs.d.ts.map
import { z } from 'zod';
import type { DatabaseAdapter } from '../db/interfaces/index.js';
import type { SchemaType } from '../types/schemas.js';
import type { JobHandlerMap } from './types.js';
/** Reserved built-in job type. */
export declare const ASSET_REFERENCES_BACKFILL_JOB = "asset-references.backfill";
/** Reserved built-in job type for the document-to-document reference index. */
export declare const DOCUMENT_REFERENCES_BACKFILL_JOB = "references.backfill";
/**
 * Bump when indexing semantics change and every org needs one more rebuild.
 *
 * **Anything that changes what `collectAssetReferences` finds is such a change**
 * — a new wrapper shape, a fixed gap, a corrected field path. Forgetting is
 * quiet and confusing: the job already completed under the old key, so the fix
 * ships, nothing re-runs, and the index stays wrong in exactly the way that was
 * just fixed. v3 is the rich-text image shape, which v2 ran without.
 *
 * The idempotency key is the marker for "this org has been backfilled" — a
 * completed job row, which `scheduleJob` returns instead of inserting a
 * duplicate. That makes enqueueing free to attempt on every request and correct
 * to attempt only once, without a flag anywhere that a normal write could set by
 * accident. The previous design inferred it from "does the index have any rows",
 * which the incremental path also satisfies, so the rebuild it was gating never
 * ran a second time and never could.
 */
export declare const REFERENCE_BACKFILL_VERSION = 5;
export declare const assetReferencesBackfillKey: (organizationId: string) => string;
export declare const documentReferencesBackfillKey: (organizationId: string) => string;
/** Identifiers only — the handler re-reads content itself, as every job should. */
export declare const assetReferencesBackfillPayload: z.ZodObject<{
    documentTypes: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export interface AssetReferenceJobDeps {
    databaseAdapter: DatabaseAdapter;
    schemaTypes: SchemaType[];
}
/**
 * Handler for the one-time index rebuild.
 *
 * Idempotent by construction rather than by short-circuit: rows are *replaced*
 * per document, so running it twice converges on the same index, and the
 * at-least-once delivery the queue guarantees costs duplicate work at worst.
 *
 * An earlier version tried to be idempotent by returning early once the org had
 * any rows. That is not idempotence, it is a latch — and because ordinary saves
 * also create rows, it latched shut before the rebuild had ever run.
 */
export declare function createAssetReferenceJobHandlers(deps: AssetReferenceJobDeps): JobHandlerMap;
//# sourceMappingURL=asset-reference-jobs.d.ts.map
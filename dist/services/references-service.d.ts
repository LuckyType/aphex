import type { DatabaseAdapter } from '../db/interfaces/index.js';
import type { SchemaType } from '../types/schemas.js';
/**
 * Maintains the back-reference index. After every doc save the collection-API
 * calls into here with the doc's draftData (the freshly-saved version) and
 * its schema; we walk the data via the schema-aware walker, dedupe the
 * resulting ref IDs, and atomically replace the rows for that referencer.
 *
 * **Written inside the document's own write transaction, and failures throw.**
 *
 * Previously logged-and-swallowed, on the grounds that a stale index shouldn't
 * block a save. The trouble is what reads it: the publish and unpublish guards.
 * An under-populated index there doesn't show a wrong badge, it lets a
 * still-referenced document be unpublished — the index says nothing points at
 * it, so nothing stops you. A guard that silently weakens when a write failed is
 * worse than no guard, because it is trusted.
 *
 * Same contract as the sibling {@link AssetReferencesService}, for the same
 * reason, and see its note for the tradeoff being accepted.
 */
export declare class ReferencesService {
    private databaseAdapter;
    constructor(databaseAdapter: DatabaseAdapter);
    /**
     * Sync the back-reference rows for a single document. Idempotent —
     * safe to call repeatedly with the same data.
     *
     * Takes the adapter to write through so the caller can pass a
     * `withTransaction` handle and have these rows commit with the document.
     */
    syncReferencesFor(db: DatabaseAdapter, organizationId: string, documentId: string, data: unknown, schema: SchemaType | null, registry: SchemaType[]): Promise<void>;
    /**
     * One-time rebuild for content that predates the index. Unconditional — see
     * {@link AssetReferencesService.backfill} for why the old "is the table empty"
     * gate was unsound, and what replaced it.
     */
    backfill(organizationId: string, schemas: SchemaType[]): Promise<void>;
}
//# sourceMappingURL=references-service.d.ts.map
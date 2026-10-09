import type { CacheAdapter } from '../cache/index.js';
import type { DatabaseAdapter } from '../db/index.js';
/**
 * HierarchyService — caches organization parent→child lookups
 * using the shared CacheAdapter.
 *
 * Lives in cms-core so every adapter (PostgreSQL, SQLite, MongoDB)
 * benefits from the same caching without reimplementing it.
 */
export declare class HierarchyService {
    private db;
    private cache;
    private ttl;
    private static DEFAULT_TTL;
    private inflight;
    constructor(db: DatabaseAdapter, cache?: CacheAdapter | null, ttl?: number);
    getChildOrganizations(parentOrganizationId: string): Promise<string[]>;
    /**
     * Get the parent org ID plus all its child org IDs.
     * Convenience for building filterOrganizationIds arrays.
     */
    getOrgIdsWithChildren(organizationId: string): Promise<string[]>;
    invalidate(parentOrganizationId: string): Promise<void>;
    flush(): Promise<void>;
}
//# sourceMappingURL=hierarchy-service.d.ts.map
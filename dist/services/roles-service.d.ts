import type { CacheAdapter } from '../cache/index.js';
import type { DatabaseAdapter } from '../db/index.js';
import { type Role } from '../types/capabilities.js';
/**
 * RolesService — caches per-org role capability lookups.
 *
 * Mirrors HierarchyService's shape so both services share cache and
 * in-flight deduplication patterns.
 */
export declare class RolesService {
    private db;
    private cache;
    private ttl;
    private static DEFAULT_TTL;
    private inflight;
    constructor(db: DatabaseAdapter, cache?: CacheAdapter | null, ttl?: number);
    /**
     * Resolve the capability list for `(organizationId, roleName)`.
     *
     * Fallback order:
     *   1. Cache hit.
     *   2. DB lookup for the `(org, name)` row.
     *   3. Built-in seed if the name matches a built-in.
     *   4. Empty list — unknown role → no capabilities.
     */
    getCapabilities(organizationId: string, roleName: string): Promise<string[]>;
    /** List every role defined for an organization. */
    listRoles(organizationId: string): Promise<Role[]>;
    /** Idempotent — safe to call on every request if you want. */
    ensureBuiltins(organizationId: string): Promise<void>;
    /** Invalidate cache entries for a single role. Call after mutation. */
    invalidate(organizationId: string, roleName?: string): Promise<void>;
    private resolveFromDb;
}
//# sourceMappingURL=roles-service.d.ts.map
/**
 * HierarchyService — caches organization parent→child lookups
 * using the shared CacheAdapter.
 *
 * Lives in cms-core so every adapter (PostgreSQL, SQLite, MongoDB)
 * benefits from the same caching without reimplementing it.
 */
export class HierarchyService {
    db;
    cache;
    ttl;
    static DEFAULT_TTL = 60; // 60 seconds
    inflight = new Map();
    constructor(db, cache = null, ttl = HierarchyService.DEFAULT_TTL) {
        this.db = db;
        this.cache = cache;
        this.ttl = ttl;
    }
    async getChildOrganizations(parentOrganizationId) {
        if (!this.db.hierarchyEnabled) {
            return [];
        }
        const key = `hierarchy:${parentOrganizationId}`;
        // Check cache first
        if (this.cache) {
            const cached = await this.cache.get(key);
            if (cached)
                return cached;
        }
        // Deduplicate concurrent requests — if a fetch is already in flight
        // for this org, wait for that instead of hitting the DB again
        const existing = this.inflight.get(key);
        if (existing)
            return existing;
        const promise = this.db.getChildOrganizations(parentOrganizationId).then(async (ids) => {
            if (this.cache) {
                await this.cache.set(key, ids, this.ttl);
            }
            this.inflight.delete(key);
            return ids;
        });
        this.inflight.set(key, promise);
        return promise;
    }
    /**
     * Get the parent org ID plus all its child org IDs.
     * Convenience for building filterOrganizationIds arrays.
     */
    async getOrgIdsWithChildren(organizationId) {
        const childIds = await this.getChildOrganizations(organizationId);
        return childIds.length > 0 ? [organizationId, ...childIds] : [organizationId];
    }
    async invalidate(parentOrganizationId) {
        if (this.cache) {
            await this.cache.delete(`hierarchy:${parentOrganizationId}`);
        }
    }
    async flush() {
        if (this.cache) {
            await this.cache.invalidateByPrefix('hierarchy:');
        }
    }
}

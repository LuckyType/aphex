// services/roles-service.ts
//
// Resolves an org + role name to a concrete capability set, with a TTL cache
// and a built-in fallback so a missing row never locks an org out.
import { BUILTIN_ROLE_SEED, BUILTIN_ROLE_NAMES } from '../types/capabilities.js';
import { cmsLogger } from '../utils/logger.js';
/**
 * RolesService — caches per-org role capability lookups.
 *
 * Mirrors HierarchyService's shape so both services share cache and
 * in-flight deduplication patterns.
 */
export class RolesService {
    db;
    cache;
    ttl;
    static DEFAULT_TTL = 30; // 30 seconds — roles change infrequently but should pick up edits quickly.
    inflight = new Map();
    constructor(db, cache = null, ttl = RolesService.DEFAULT_TTL) {
        this.db = db;
        this.cache = cache;
        this.ttl = ttl;
    }
    /**
     * Resolve the capability list for `(organizationId, roleName)`.
     *
     * Fallback order:
     *   1. Cache hit.
     *   2. DB lookup for the `(org, name)` row.
     *   3. Built-in seed if the name matches a built-in.
     *   4. Empty list — unknown role → no capabilities.
     */
    async getCapabilities(organizationId, roleName) {
        const key = cacheKey(organizationId, roleName);
        if (this.cache) {
            const cached = await this.cache.get(key);
            if (cached)
                return cached;
        }
        const existing = this.inflight.get(key);
        if (existing)
            return existing;
        const promise = this.resolveFromDb(organizationId, roleName).then(async (caps) => {
            if (this.cache)
                await this.cache.set(key, caps, this.ttl);
            this.inflight.delete(key);
            return caps;
        });
        this.inflight.set(key, promise);
        return promise;
    }
    /** List every role defined for an organization. */
    async listRoles(organizationId) {
        return this.db.listRoles(organizationId);
    }
    /** Idempotent — safe to call on every request if you want. */
    async ensureBuiltins(organizationId) {
        await this.db.seedBuiltinRoles(organizationId);
    }
    /** Invalidate cache entries for a single role. Call after mutation. */
    async invalidate(organizationId, roleName) {
        if (!this.cache)
            return;
        if (roleName) {
            await this.cache.delete(cacheKey(organizationId, roleName));
            return;
        }
        await this.cache.invalidateByPrefix(`roles:${organizationId}:`);
    }
    // ---- internals -----------------------------------------------------------
    async resolveFromDb(organizationId, roleName) {
        const row = await this.db.findRoleByName(organizationId, roleName);
        if (row) {
            cmsLogger.debug('[RBAC]', `Resolved role "${roleName}" in org=${organizationId} via DB (${row.capabilities.length} caps)`);
            return row.capabilities;
        }
        // Defense in depth: if a built-in row went missing (e.g. not yet seeded
        // on a pre-existing org), fall back to the hard-coded seed so the app
        // stays functional until `ensureBuiltins` runs.
        if (BUILTIN_ROLE_NAMES.includes(roleName)) {
            cmsLogger.warn('[RBAC]', `Role "${roleName}" not found in org=${organizationId} — using BUILTIN_ROLE_SEED fallback. Run ensureBuiltins.`);
            return [...BUILTIN_ROLE_SEED[roleName].capabilities];
        }
        cmsLogger.warn('[RBAC]', `Unknown role "${roleName}" in org=${organizationId} — granting no capabilities`);
        return [];
    }
}
function cacheKey(organizationId, roleName) {
    return `roles:${organizationId}:${roleName}`;
}

import type { CMSInstances } from '../hooks.js';
export interface HealthResult {
    /** True only when every checked dependency is healthy. What a load balancer reads. */
    ok: boolean;
    /** Database adapter reachable and answering. */
    db: boolean;
    /** Storage adapter reachable and answering. */
    storage: boolean;
}
export interface HealthOptions {
    /**
     * Per-check bound in milliseconds. A check that exceeds it counts as unhealthy.
     * Keep it below the platform's probe timeout, or the platform gives up first and
     * the bound never does anything. Default 5000.
     */
    timeoutMs?: number;
}
/**
 * Check every adapter the CMS depends on to serve a request.
 *
 * Checks run concurrently, so the call takes as long as the slowest one rather
 * than their sum, and is bounded by `timeoutMs` either way.
 *
 * ```ts
 * // src/routes/healthz/+server.ts
 * import { json } from '@sveltejs/kit';
 * import { checkHealth } from '@aphexcms/cms-core/server';
 *
 * export const GET = async ({ locals }) => {
 *   const health = await checkHealth(locals.aphexCMS);
 *   return json(health, { status: health.ok ? 200 : 503 });
 * };
 * ```
 *
 * 503, not 500, on failure: the process is alive but not ready to serve, which is
 * what tells an orchestrator to stop routing traffic here without recycling the
 * container.
 */
export declare function checkHealth(cms: Pick<CMSInstances, 'databaseAdapter' | 'storageAdapter'>, options?: HealthOptions): Promise<HealthResult>;
//# sourceMappingURL=health.d.ts.map
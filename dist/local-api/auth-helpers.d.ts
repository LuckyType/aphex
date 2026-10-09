import type { Auth } from '../types/auth.js';
import type { LocalAPIContext } from './types.js';
/**
 * Convert SvelteKit locals.auth to LocalAPIContext
 *
 * This helper bridges the gap between the authentication system
 * (handled in the app layer and enriched by handleAuthHook) and
 * the LocalAPI's context-based approach.
 *
 * Preserves the full Auth object in context.auth so custom permission
 * logic can access any custom fields added via module augmentation.
 *
 * @param auth - Auth object from locals.auth (already validated by handleAuthHook)
 * @returns LocalAPIContext for use with LocalAPI operations
 *
 * @example
 * ```typescript
 * // In a SvelteKit route handler
 * import { authToContext } from '@aphexcms/cms-core/local-api';
 *
 * export const GET: RequestHandler = async ({ locals }) => {
 *   const api = locals.aphexCMS.localAPI;
 *   const context = authToContext(locals.auth);
 *
 *   const pages = await api.collections.page.find(context, {
 *     where: { status: { equals: 'published' } }
 *   });
 *
 *   return json({ data: pages });
 * };
 * ```
 */
export declare function authToContext(auth: Auth | null | undefined): LocalAPIContext;
/**
 * Check if auth exists and convert to context
 * Alias for authToContext - more semantic in some contexts
 *
 * @param auth - Auth object from locals.auth
 * @returns LocalAPIContext
 * @throws Error if auth is missing or invalid
 */
export declare function requireAuth(auth: Auth | null | undefined): LocalAPIContext;
/**
 * Create a system context for operations that bypass normal permissions
 * Use this for seed scripts, cron jobs, migrations, and other system-level operations
 *
 * @param organizationId - Organization ID for the operation
 * @returns LocalAPIContext with overrideAccess: true
 *
 * @example
 * ```typescript
 * // In a seed script
 * import { systemContext } from '@aphexcms/cms-core/local-api';
 *
 * const api = getLocalAPI();
 * const context = systemContext('org_123');
 *
 * await api.collections.page.create(context, {
 *   data: { title: 'Home', slug: 'home' },
 *   publish: true
 * });
 * ```
 */
export declare function systemContext(organizationId: string): LocalAPIContext;
//# sourceMappingURL=auth-helpers.d.ts.map
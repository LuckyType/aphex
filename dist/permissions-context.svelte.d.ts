import type { Capability } from './types/capabilities.js';
export interface PermissionsContext {
    /** Current capability list (reactive). */
    readonly capabilities: readonly string[];
    /**
     * Effective organization role name (reactive). `null` when the caller has
     * no role (API key, unauthenticated). Used for role-name-based checks
     * such as field-level access lists.
     */
    readonly role: string | null;
    /**
     * True if the session has the named capability. Accepts core `Capability` ids
     * (with autocomplete) or any plugin-declared capability string.
     */
    can(cap: Capability | (string & {})): boolean;
    /** True if the session has at least one of the capabilities. */
    canAny(...caps: (Capability | (string & {}))[]): boolean;
    /** True if the session has every one of the capabilities. */
    canAll(...caps: (Capability | (string & {}))[]): boolean;
}
/**
 * Publish a capability context to descendants.
 *
 * `getCapabilities` is a getter rather than a static array so reactive
 * sources (Svelte state, `$page.data.rbac.capabilities`) propagate: every
 * `can()` call re-reads through the closure.
 *
 * @example
 * ```svelte
 * <script>
 *   import { page } from '$app/state';
 *   import { setPermissionsContext } from '@aphexcms/cms-core';
 *   setPermissionsContext(() => page.data.rbac?.capabilities ?? []);
 * </script>
 * ```
 */
export declare function setPermissionsContext(getCapabilities: () => readonly string[], getRole?: () => string | null): PermissionsContext;
/**
 * Read the capability context set by an ancestor.
 *
 * When no provider is present (e.g. a component rendered in isolation during
 * tests or Storybook), returns a deny-all stub with a one-time dev warning
 * rather than throwing — that way consumers degrade to "no affordances shown"
 * instead of crashing the tree.
 */
export declare function usePermissions(): PermissionsContext;
//# sourceMappingURL=permissions-context.svelte.d.ts.map
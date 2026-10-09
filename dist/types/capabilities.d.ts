import type { Auth } from './auth.js';
import type { OrganizationRole } from './organization.js';
/**
 * Flat, serializable permission primitives.
 *
 * Append-only: removing or renaming a value silently weakens every call site.
 * If a capability is no longer needed, leave the string and stop granting it.
 */
export type Capability = 'document.read' | 'document.create' | 'document.update' | 'document.delete' | 'document.publish' | 'document.unpublish' | 'asset.read' | 'asset.upload' | 'asset.delete' | 'member.invite' | 'member.remove' | 'member.changeRole' | 'apiKey.manage' | 'role.manage' | 'org.settings' | 'plugin.settings.manage';
/**
 * Enumerate every capability. Useful for owner seeding and validation.
 */
export declare const ALL_CAPABILITIES: readonly Capability[];
/**
 * Metadata for one capability — a registry entry. Turns a bare permission string
 * into something the roles UI can present (title, help text, grouping). Built-ins
 * are defined below; plugins add their own via the `aphex/capabilities` part, and
 * the part resolver merges both into one catalog (`resolver.capabilityCatalog()`).
 */
export interface CapabilityDefinition {
    /** The permission string checked at runtime, e.g. `'document.publish'`. */
    id: string;
    /** Human label shown in the roles UI. */
    title: string;
    /** One-line explanation shown under the title. */
    description?: string;
    /** Group heading in the roles UI, e.g. `'Documents'`. */
    group?: string;
}
/**
 * Define a capability with metadata. Plugins pass these to the `aphex/capabilities`
 * part so their permissions appear (and are assignable) in the roles UI.
 *
 * @example
 * defineCapability('forms.export', { title: 'Export submissions', group: 'Forms' })
 */
export declare function defineCapability(id: string, meta?: Partial<Omit<CapabilityDefinition, 'id'>>): CapabilityDefinition;
/** Fallback label for a bare id: `document.publish` → `Publish` (last segment, title-cased). */
export declare function prettifyCapabilityId(id: string): string;
/** The built-in capability catalog — metadata for every core capability. */
export declare const BUILTIN_CAPABILITY_DEFS: readonly CapabilityDefinition[];
/**
 * Merge the built-in catalog with extra (plugin) definitions, deduped by id — the
 * first definition of an id wins, so plugins can't silently redefine a core cap.
 */
export declare function mergeCapabilityCatalog(extra?: readonly CapabilityDefinition[]): CapabilityDefinition[];
/**
 * Built-in role names. These are the guaranteed defaults every org receives.
 * Custom role names are any other string.
 */
export declare const BUILTIN_ROLE_NAMES: readonly OrganizationRole[];
/**
 * Seed data for the four built-in roles.
 *
 * For viewer/editor/admin this is the **default floor** — the set of capabilities
 * a freshly-created org starts with. Once seeded, rows live in `cms_roles` and can
 * be edited by admins via the Roles UI; they are never force-updated afterwards,
 * so a capability added by a later core upgrade is not granted retroactively.
 *
 * `owner` is different: it is an **invariant**, not a floor. It is always the whole
 * of ALL_CAPABILITIES, is rejected by the roles PATCH route, and is reconciled on
 * every boot (see CMSEngine.reconcileBuiltinRoles) so new capabilities reach orgs
 * that were seeded before those capabilities existed.
 *
 * Also acts as the defense-in-depth fallback: if a role lookup misses (e.g.
 * a row got deleted out-of-band for a built-in name), the checker falls back
 * to this map rather than locking the org out.
 */
export declare const BUILTIN_ROLE_SEED: Record<OrganizationRole, {
    description: string;
    capabilities: readonly Capability[];
}>;
/**
 * Idempotently expand a capability list so that any write cap drags in the
 * corresponding read. Used by both the role schema and the API-key schema.
 * Accepts `string[]` since a granted list may include plugin capability ids; the
 * built-in read/write implications only touch known core ids and pass others through.
 */
export declare function normalizeCapabilities(caps: readonly string[]): string[];
/**
 * A persisted role row (per organization).
 */
export interface Role {
    id: string;
    organizationId: string;
    name: string;
    description: string | null;
    capabilities: string[];
    isBuiltIn: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface NewRole {
    organizationId: string;
    name: string;
    description?: string | null;
    capabilities: string[];
    isBuiltIn?: boolean;
}
/**
 * Build the four built-in role rows for a newly-created organization.
 * Used by migration, org-creation, and the runtime seeder.
 */
export declare function buildBuiltinRoleRows(organizationId: string): NewRole[];
export declare function isInstanceRole(auth: Auth): boolean;
/**
 * Check whether an Auth already has a capability.
 *
 * Expects `auth.capabilities` to have been populated by the auth hook via
 * RolesService. If absent (e.g. legacy call site), falls back to the built-in
 * seed for the org role so behavior remains safe.
 */
export declare function hasCapability(auth: Auth, capability: Capability | (string & {})): boolean;
/**
 * Expand an API key's coarse `read`/`write` scopes into capabilities.
 *
 * The compatibility path for keys issued before the capability model existed,
 * and the default for keys created without an explicit allowlist.
 *
 * **This expansion is not itself a permission check.** It says what the scopes
 * mean, not what the key's owner may actually do — the caller is responsible for
 * intersecting the result with the owner's grantable set before trusting it, or
 * a `write` key would confer `document.delete` to an owner whose role never had
 * it. `AuthService.validateApiKey` does that clamp; anything else deriving
 * capabilities from scopes must too.
 */
export declare function coarseApiKeyCapabilities(permissions: readonly string[]): string[];
/**
 * Resolve the effective capability set for an Auth.
 *
 * Precedence:
 *   1. `auth.capabilities` (pre-resolved by the auth hook) — authoritative.
 *   2. Instance-role override (super_admin/admin) → all capabilities.
 *   3. API keys → derived from `read`/`write` scopes.
 *   4. Session fallback → built-in seed for the org role.
 *   5. Partial session → empty set.
 *
 * Every branch is passed through {@link normalizeCapabilities}, so the
 * write-implies-read invariant holds at *resolve* time and not merely at write
 * time. `normalizeCapabilities` is otherwise only applied by the role and
 * API-key request schemas, which covers the admin UI but not seeds, migrations,
 * plugins, or rows written directly — and the read routes now depend on
 * `asset.read`/`document.read` actually being present. Without this, a role
 * persisted with `asset.upload` alone would be able to upload an asset and then
 * get a 403 listing it. It can only ever add a read cap alongside a write cap
 * that already survived whatever clamp produced the set, so it never widens
 * access beyond what the principal was already granted.
 */
export declare function resolveCapabilities(auth: Auth): ReadonlySet<string>;
/**
 * Resolve the effective organization role name for an Auth, honoring
 * instance-role overrides. Returns the role name as a string — built-in or
 * custom — or `null` for partial sessions and API keys.
 *
 * Used by schema-level access lists: an allowlist like
 * `['admin','owner','Testing']` is matched literally against this value, so
 * custom role names participate just like built-ins do.
 */
export declare function effectiveOrganizationRole(auth: Auth): string | null;
/**
 * Shape of the RBAC payload exposed to the client by the admin layout's
 * server load. Mirror this in `App.PageData` so Svelte pages can read
 * `$page.data.rbac` without casting to `any`.
 */
export interface RbacPayload {
    /** Current organization role name (built-in or custom). `null` for none. */
    role: string | null;
    /** Capabilities resolved for this session. Safe to treat as read-only. */
    capabilities: Capability[];
}
//# sourceMappingURL=capabilities.d.ts.map
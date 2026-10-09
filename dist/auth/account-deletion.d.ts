import type { DatabaseAdapter } from '../db/interfaces/index.js';
/**
 * Thrown when an account may not be deleted yet. Providers translate it into their own
 * transport error; the message is written to be shown to the user as-is.
 */
export declare class AccountDeletionBlockedError extends Error {
    readonly code = "ACCOUNT_DELETION_BLOCKED";
    constructor(message: string);
}
/**
 * Throws unless this user can leave without stranding an organization.
 *
 * The rule is narrow on purpose: an organization whose only owner deletes their account has
 * nobody left who can add members, change roles, or delete it — the org becomes unreachable
 * to everyone including its remaining members, and no in-product path can recover it. Being
 * the sole *member* is fine, because deleting the organization first is a thing the user can
 * actually do; being the sole *owner* of an org with other people in it is the trap.
 *
 * Enforced server-side rather than in the confirmation dialog: the endpoint is reachable
 * without the UI, and this is the check that decides whether an organization survives.
 */
export declare function assertAccountDeletable(db: DatabaseAdapter, userId: string): Promise<void>;
/**
 * Detach a deleted user from every organization.
 *
 * `cms_organization_members.user_id` has no foreign key to the profile table — memberships
 * reference the auth layer's user, which cms-core doesn't own — so nothing cascades and a
 * deleted account would otherwise keep appearing in member lists indefinitely, still holding
 * whatever role it had.
 *
 * Call inside the same transaction as the profile delete, after the erasure events are
 * emitted (those read the memberships to know which organizations to fan out to).
 */
export declare function detachUserFromOrganizations(tx: DatabaseAdapter, userId: string, organizationIds: readonly string[]): Promise<void>;
//# sourceMappingURL=account-deletion.d.ts.map
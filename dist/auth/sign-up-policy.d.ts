import type { BootstrapPolicy, InstanceRole } from './bootstrap.js';
import type { DatabaseAdapter } from '../db/interfaces/index.js';
import type { UserProfile } from '../types/index.js';
/**
 * Thrown when sign-up is refused by policy.
 *
 * Providers translate this into whatever their transport expects — Better Auth
 * raises an `APIError`, a REST handler might return 403. The message is written
 * to be safe to show a user.
 */
export declare class SignUpBlockedError extends Error {
    readonly code = "SIGN_UP_BLOCKED";
    constructor(message: string);
}
export interface SignUpGateOptions {
    db: DatabaseAdapter;
    /** Address attempting to register. Matched case-insensitively. */
    email: string | undefined;
    /** When false the gate is disabled entirely and this is a no-op. */
    inviteOnly: boolean;
}
/**
 * Throws `SignUpBlockedError` unless this address may create an account.
 *
 * Two ways through: the instance is provably empty (nobody exists yet to have
 * sent an invitation, so gating the first sign-up would lock the door with the
 * keys inside), or the address holds a pending invitation.
 *
 * Narrowing that first exception is the bootstrap policy's job — see
 * `resolveBootstrapRole` — not this gate's.
 */
export declare function assertSignUpAllowed({ db, email, inviteOnly }: SignUpGateOptions): Promise<void>;
export interface BootstrapRoleOptions {
    db: DatabaseAdapter;
    user: {
        id: string;
        email: string;
        emailVerified: boolean;
    };
    /** The request that triggered profile creation, when there is one. */
    request?: Request;
    bootstrap: BootstrapPolicy;
}
/**
 * Runs the bootstrap policy for a brand-new user, returning the instance role to
 * grant or `null` for none.
 *
 * Deliberately not wrapped in a transaction. SQLite allows a single writer, and
 * holding that lock across the policy's own round-trips collides with the auth
 * provider's concurrent user/session inserts (SQLITE_BUSY). The atomicity was
 * only partial anyway — see `claimCode`: a claim is single-use, not mutually
 * exclusive.
 */
export declare function resolveBootstrapRole({ db, user, request, bootstrap }: BootstrapRoleOptions): Promise<InstanceRole | null>;
/**
 * The one place a CMS user profile is created for a newly-authenticated user.
 *
 * Every `AuthProvider` should route new profiles through here so bootstrap
 * promotion happens identically regardless of who did the authenticating.
 */
export declare function createUserProfileWithBootstrap(options: BootstrapRoleOptions): Promise<UserProfile>;
//# sourceMappingURL=sign-up-policy.d.ts.map
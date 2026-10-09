import type { DatabaseAdapter } from '../db/interfaces/index.js';
/** Instance-level role a bootstrap policy may grant. */
export type InstanceRole = 'super_admin' | 'admin' | 'editor' | 'viewer';
export interface BootstrapContext {
    user: {
        id: string;
        email: string;
        emailVerified: boolean;
    };
    /**
     * True only when the system is *provably* empty.
     *
     * Never inferred from a missing capability: an adapter that can't answer the
     * question yields `false`, so an unanswerable check can't be mistaken for
     * "nobody is here yet, promote this person".
     */
    isFirstUser: boolean;
    /** The request that triggered profile creation, when there is one. */
    request?: Request;
    db: DatabaseAdapter;
}
/**
 * Decides what instance role a brand-new user profile gets.
 *
 * Bootstrapping is a policy decision, not a library one — how you claim a fresh
 * instance depends on how you deploy it. Return `null` for "no promotion"; the
 * caller falls back to the ordinary `editor` role.
 */
export interface BootstrapPolicy {
    (ctx: BootstrapContext): Promise<InstanceRole | null>;
    /**
     * Optional one-off startup step, run before any request is served.
     *
     * Lets a recipe own its own setup instead of making the app wire it: only
     * `claimCode()` needs one (to generate and log its code), and an app that
     * swaps recipes shouldn't have to remember to delete a hook. Callers invoke
     * it as `policy.prepare?.(db)` — recipes without setup simply omit it.
     */
    prepare?: (db: DatabaseAdapter) => Promise<void>;
}
/**
 * Ensure an unclaimed instance has a pending claim code, and log it.
 *
 * Only the **hash** is persisted: a leaked database dump or backup shouldn't be
 * enough to claim the instance. Called at startup by `claimCode()` consumers.
 */
export declare function ensureClaimCode(db: DatabaseAdapter): Promise<void>;
/**
 * True when nobody has claimed this instance yet and a code is waiting to be
 * used. Drives the sign-up form's claim-code field: without this the code has
 * nowhere to go but a hand-set cookie, which is not a flow anyone can follow.
 *
 * Deliberately narrow. It reveals only that an instance is unclaimed — never the
 * code or its hash — so it is safe to hand to an unauthenticated page. That fact
 * is already obvious to anyone who can reach a CMS with no users in it.
 */
export declare function isInstanceUnclaimed(db: DatabaseAdapter): Promise<boolean>;
/**
 * The default. Keeps the familiar first-run wizard, but promotion requires a
 * code printed to the server log at startup — so arriving first isn't enough,
 * you also have to control the deployment. Same shape as Jupyter's `?token=`
 * and GitLab's generated root password.
 *
 * Clearing the hash here is not what makes the code single-use — two concurrent
 * claims can both read it before either clears it. Mutual exclusion comes from
 * `tryClaimBootstrap`, which `createUserProfileWithBootstrap` takes before
 * granting any instance role: the loser is demoted to an ordinary profile even
 * though this returned `super_admin`. Clearing the hash still matters, just for
 * the sequential case — it stops the code being reused later.
 *
 * One residual: a claim can be spent by a request whose profile insert then
 * fails, which costs a code rather than granting anything. Recover by clearing
 * the key from instance settings and restarting for a fresh one.
 */
export declare function claimCode(options?: {
    readCode?: (request?: Request) => string | undefined;
}): BootstrapPolicy;
/**
 * First user whose address is on the allowlist becomes super admin — Discourse's
 * `DISCOURSE_DEVELOPER_EMAILS`. Good when you know the owner's address at deploy
 * time and would rather not read logs.
 *
 * This recipe is only as strong as the address is trustworthy, so pair it with
 * `requireEmailVerification`. That's enforced at the auth layer — better-auth
 * refuses to complete sign-in for an unconfirmed address, so an unverified user
 * never reaches profile creation at all. Re-checking it here would be dead code
 * when verification is on, and would brick a fresh install when it's off.
 */
export declare function allowlistEmail(emails: string | readonly string[] | undefined): BootstrapPolicy;
/**
 * Whoever signs up first becomes super admin, with nothing else required.
 *
 * This is what WordPress, Ghost, Strapi and Payload do, and it's fine when you
 * install immediately after deploying. It is **not** fine for an instance that
 * sits reachable before anyone signs in: the first stranger to find the URL owns
 * it. Opt in deliberately.
 */
export declare function openFirstUser(): BootstrapPolicy;
/**
 * Never promote anyone. Provision the first administrator out of band — a seed
 * script, a migration, or a direct row — the way Directus and Keycloak do.
 */
export declare function never(): BootstrapPolicy;
//# sourceMappingURL=bootstrap.d.ts.map
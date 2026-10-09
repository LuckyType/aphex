import type { EventJobAdapter } from '../db/interfaces/events.js';
import type { Job } from '../types/events.js';
/**
 * The slice of the adapter these helpers need.
 *
 * Structural on purpose: a full `DatabaseAdapter`, a bare `EventJobAdapter`, or a
 * transaction handle all satisfy it, so callers never have to widen a parameter
 * type to use them.
 */
export type RecurringJobScheduler = Pick<EventJobAdapter, 'listJobs' | 'scheduleJob'>;
export interface EnsureRecurringJobOptions {
    organizationId: string;
    /** Job type, which is also the chain's identity — one live job of this type is one chain. */
    type: string;
    /**
     * When the first tick should run. Defaults to now.
     *
     * Pass one interval out when the caller has just done the work by hand (a "Sync
     * now" button that also arms the schedule), so arming doesn't immediately repeat it.
     */
    runAt?: Date;
    payload?: Record<string, unknown>;
    maxAttempts?: number;
    createdBy?: string | null;
}
export interface EnsureRecurringJobResult {
    /** True when this call started the chain; false when one was already running. */
    armed: boolean;
    /** The job now carrying the chain — the one just enqueued, or the one already live. */
    job: Job;
}
/**
 * Make sure a chain of `type` is running for this organization, starting one if not.
 *
 * Safe and cheap to call on any path that implies "this feature is in use" — opening
 * a settings panel, a manual sync, a health check. Two calls a second apart start one
 * chain; a call a week after the chain died starts a new one.
 *
 * **Liveness, not an idempotency key.** The obvious implementation is a keyed
 * bootstrap job, and it is wrong in a way that only shows up later: `scheduleJob`'s
 * key lookup returns the existing row whatever its status, so once the bootstrap job
 * has completed — which it does immediately, that being the point — every later call
 * gets that finished row back and no-ops. The chain it started can then die and never
 * be revived, and the arming call that was supposed to notice reports success. Asking
 * "is there a pending or leased job of this type?" answers the question actually being
 * asked, and answers it correctly in both directions: it never starts a second live
 * chain, and it always revives a dead one.
 *
 * (`scheduleJob({ resurrect: true })` fixes the *other* half of that problem — a key
 * whose job dead-lettered. It doesn't help here, because a chain's ticks are separate
 * rows from its bootstrap; liveness is the right question for a chain either way.)
 */
export declare function ensureRecurringJob(adapter: RecurringJobScheduler, options: EnsureRecurringJobOptions): Promise<EnsureRecurringJobResult>;
export interface ScheduleNextTickOptions {
    /** How long after now the next tick runs. */
    intervalMs: number;
    /** Payload for the next tick. Defaults to carrying the current tick's forward. */
    payload?: Record<string, unknown>;
    /** Base for the next run time. Defaults to now — i.e. interval measured from completion. */
    from?: Date;
}
/**
 * Enqueue the next tick of a chain, from inside the current tick's handler.
 *
 * Call it before the handler returns; returning without calling it is how a chain
 * ends, which is the intended way to switch a schedule off.
 *
 * Type, organization and attempt budget are inherited from the running job, so a
 * chain can't drift into scheduling a different job than the one it is. There is no
 * idempotency key: every tick is genuinely a new job, and a key would collapse the
 * whole chain onto one row.
 *
 * Note the interval is measured from `from` (now by default), not from the tick's
 * scheduled time — so a chain that falls behind spaces out rather than trying to
 * catch up with a burst.
 */
export declare function scheduleNextTick(adapter: Pick<EventJobAdapter, 'scheduleJob'>, job: Job, options: ScheduleNextTickOptions): Promise<Job>;
//# sourceMappingURL=recurring.d.ts.map
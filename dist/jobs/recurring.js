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
export async function ensureRecurringJob(adapter, options) {
    const live = await adapter.listJobs({
        organizationId: options.organizationId,
        type: options.type,
        // `leased` counts as live: a worker is holding that tick right now, and it will
        // enqueue the next one when it settles. Treating it as dead would double the chain.
        status: ['pending', 'leased'],
        limit: 1
    });
    const existing = live.items[0];
    if (existing)
        return { armed: false, job: existing };
    const job = await adapter.scheduleJob({
        organizationId: options.organizationId,
        type: options.type,
        payload: options.payload,
        runAt: options.runAt ?? new Date(),
        maxAttempts: options.maxAttempts,
        createdBy: options.createdBy
        // No idempotencyKey, deliberately — see above. The liveness check is the guard.
    });
    return { armed: true, job };
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
export async function scheduleNextTick(adapter, job, options) {
    const base = options.from ?? new Date();
    return adapter.scheduleJob({
        organizationId: job.organizationId,
        type: job.type,
        payload: options.payload ?? job.payload,
        runAt: new Date(base.getTime() + options.intervalMs),
        maxAttempts: job.maxAttempts
    });
}

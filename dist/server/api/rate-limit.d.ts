export interface RateLimitRule {
    /** Window length in milliseconds. */
    windowMs: number;
    /** Requests allowed per window. */
    max: number;
}
export interface RateLimitResult {
    allowed: boolean;
    /** Seconds until the current window rolls over — for a `Retry-After` header. */
    retryAfterSeconds: number;
}
/**
 * A named bucket of windows.
 *
 * Entries are swept lazily on write rather than on a timer: an interval would keep a
 * reference alive for the process's whole life (and in a test run, past the end of the
 * suite), and the map only grows when requests are arriving anyway.
 */
export declare class RateLimiter {
    private rule;
    private windows;
    private lastSweep;
    constructor(rule: RateLimitRule);
    /** Count one request against `key`, and say whether it may proceed. */
    check(key: string): RateLimitResult;
    /** Drop windows that have already rolled over. Runs at most once per window length. */
    private sweep;
}
/**
 * Best-effort client address for rate-limit keying.
 *
 * `x-forwarded-for` is caller-supplied and trivially spoofed unless a trusted proxy sets it,
 * so an IP bucket alone is not a control — it's the half that stops casual abuse. Pair it
 * with a bucket on something the attacker can't rotate freely (the target email address) so
 * the limit still bites when the address is forged.
 */
export declare function clientAddress(headers: Headers): string;
//# sourceMappingURL=rate-limit.d.ts.map
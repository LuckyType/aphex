import type { JobRunnerServices } from './run-batch.js';
import type { Logger } from '../utils/logger.js';
/** Handle for a running embedded loop. Call `stop()` to clear the interval. */
export interface EmbeddedJobRunner {
    stop(): void;
}
export interface EmbeddedJobRunnerOptions {
    /** Milliseconds between ticks. Default 3000. */
    intervalMs?: number;
    logger: Logger;
    /**
     * Resolve the live services at tick time (rather than capturing them once), so a schema-HMR
     * re-init that rebuilds the CMS instances is picked up automatically. Return `null` to skip a
     * tick (e.g. the app hasn't finished initializing yet).
     */
    getServices: () => JobRunnerServices | null;
}
/**
 * Start the loop. Ticks NEVER overlap: while a tick is in flight the next interval fire is
 * skipped, so a slow batch can't stack runs on top of each other. A thrown error in a tick is
 * logged and swallowed — the loop must survive a transient DB blip and keep going. The interval
 * is `unref`'d where supported so it never keeps the process alive on its own.
 */
export declare function startEmbeddedJobRunner(options: EmbeddedJobRunnerOptions): EmbeddedJobRunner;
//# sourceMappingURL=embedded-runner.d.ts.map
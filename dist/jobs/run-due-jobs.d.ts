import type { DatabaseAdapter } from '../db/interfaces/index.js';
import type { Logger } from '../utils/logger.js';
import type { JobHandlerMap } from './types.js';
export interface RunDueJobsOptions {
    databaseAdapter: DatabaseAdapter;
    handlers: JobHandlerMap;
    logger: Logger;
    /** Identifies the lease owner in `cms_jobs.lease_owner` (for crash-recovery visibility). */
    workerId: string;
    /** Scope to one tenant; omit to claim across all orgs (worker context, override access). */
    organizationId?: string;
    /** Max jobs claimed this batch. Default 10. */
    batchSize?: number;
    /** Lease duration (ms) before a claimed-but-unfinished job is reclaimable. Default 30000. */
    leaseMs?: number;
    /** First-retry delay (ms); doubles per attempt. Default 1000. */
    baseBackoffMs?: number;
    /** Backoff ceiling (ms). Default 1h. */
    maxBackoffMs?: number;
    /** Injectable clock (tests). Default `new Date()`. */
    now?: Date;
}
export interface RunDueJobsResult {
    claimed: number;
    completed: number;
    retried: number;
    failed: number;
}
export declare function runDueJobs(options: RunDueJobsOptions): Promise<RunDueJobsResult>;
//# sourceMappingURL=run-due-jobs.d.ts.map
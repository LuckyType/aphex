import type { DatabaseAdapter } from '../db/interfaces/index.js';
import type { EmailAdapter } from '../email/interfaces/email.js';
import type { Logger } from '../utils/logger.js';
import type { CMSConfig } from '../types/config.js';
import type { LocalAPI } from '../local-api/index.js';
import type { PartResolver } from '../plugins/resolver.js';
import { type RunDueJobsResult } from './run-due-jobs.js';
import { type RelayOutboxResult } from './relay.js';
import { type ConsumerAssetService, type PluginSettingsReader } from '../events/consumer.js';
/**
 * The slice of the CMS service container the runner needs. Structurally a subset
 * of `CMSInstances`, so callers can pass `event.locals.aphexCMS` (or `c.var.aphexCMS`)
 * straight through — no adapter, no cast.
 */
export interface JobRunnerServices {
    config: CMSConfig;
    databaseAdapter: DatabaseAdapter;
    logger: Logger;
    localAPI: LocalAPI;
    partResolver: PartResolver;
    /** Injected into event-consumer deliveries so a consumer can read its own decrypted settings. */
    pluginSettingsService: PluginSettingsReader;
    /** Handed to event consumers that send notifications; `null`/absent when email isn't configured. */
    emailAdapter?: EmailAdapter | null;
    /**
     * Handed to event consumers that erase or rewrite media — notably the built-in
     * `user.deleted` avatar erasure, which needs the file gone from object storage and not
     * merely the row gone from the table.
     */
    assetService?: ConsumerAssetService | null;
}
export interface RunJobsBatchOptions {
    /** Lease-owner label written to `cms_jobs.lease_owner` (crash-recovery visibility). */
    workerId?: string;
    /** Scope to one tenant; omit to claim across all orgs (worker context, override access). */
    organizationId?: string;
}
/** One tick's combined outcome: the relay fan-out plus the job execution that followed. */
export interface RunJobsBatchResult extends RunDueJobsResult {
    /** Outbox fan-out done at the top of this tick (events → delivery jobs). */
    relay: RelayOutboxResult;
}
/**
 * Run one full worker tick: relay the outbox, then run one bounded batch of due jobs with the
 * fully-assembled handler map.
 *
 * Relaying FIRST means a delivery job an event spawns this tick is already `pending` when the
 * job pass runs, so a just-published document's consumers can fire in the same tick rather than
 * waiting for the next — at the cost of nothing, since a slow consumer is still its own job.
 *
 * Handler precedence (later wins): core's built-in handlers (scheduled publish/unpublish) →
 * plugin event-consumer deliveries (`aphex/consumer:<id>`) → plugin job handlers
 * (`aphex/job/handler`) → the app's `config.jobs.handlers`. So an app can override a plugin,
 * and a plugin can override a built-in — the app always has the final say. Consumer delivery
 * types are namespaced, so they can't actually collide with the others.
 */
export declare function runJobsBatch(services: JobRunnerServices, options?: RunJobsBatchOptions): Promise<RunJobsBatchResult>;
//# sourceMappingURL=run-batch.d.ts.map
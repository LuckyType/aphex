import type { Logger } from '../utils/logger.js';
import type { DatabaseAdapter } from '../db/interfaces/index.js';
import type { PartResolver } from '../plugins/resolver.js';
/** The slice of the service container the relay needs — a structural subset of `JobRunnerServices`. */
export interface RelayServices {
    databaseAdapter: DatabaseAdapter;
    logger: Logger;
    partResolver: PartResolver;
}
export interface RelayOutboxOptions {
    /** Scope to one tenant; omit to relay across all orgs (worker context, override access). */
    organizationId?: string;
    /** Max outbox rows drained this pass. Default 100 (fan-out is cheap; relay generously). */
    batchSize?: number;
}
export interface RelayOutboxResult {
    /** Outbox rows processed this pass. */
    relayed: number;
    /** Delivery jobs enqueued (deduped enqueues still count as one each). */
    enqueued: number;
}
/**
 * Drain one bounded batch of the outbox, fanning each event out to its subscribed consumers.
 * Runs one pass and returns — the caller (the same tick as `runJobsBatch`) owns cadence.
 */
export declare function relayOutbox(services: RelayServices, options?: RelayOutboxOptions): Promise<RelayOutboxResult>;
//# sourceMappingURL=relay.d.ts.map
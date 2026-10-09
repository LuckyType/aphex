import type { DatabaseAdapter } from '../db/interfaces/index.js';
import type { EmailAdapter } from '../email/interfaces/email.js';
import type { Logger } from '../utils/logger.js';
import type { JobHandler } from '../jobs/types.js';
/**
 * The event as a consumer sees it — the immutable fields of the `cms_domain_events` row that
 * triggered this delivery. `id` is the event's id (stable across retries of the same
 * delivery), so a consumer can dedupe on it if its side effect isn't naturally idempotent.
 */
export interface ConsumedEvent {
    id: string;
    type: string;
    organizationId: string;
    payload: Record<string, unknown>;
    correlationId: string | null;
    causationId: string | null;
    createdBy: string | null;
    createdAt: Date;
}
/**
 * Reads a plugin's resolved, **decrypted** per-org settings — bound to the triggering event's
 * organization, so a consumer can pull its own config (connection details, `secret` fields like
 * API keys) without threading org ids around. `pluginId` is the settings declaration's id (the
 * plugin's package name); an author reading their own plugin's settings passes their own id.
 * The `.get(orgId, pluginId)` on the host's PluginSettingsService satisfies this structurally.
 */
export interface PluginSettingsReader {
    get(organizationId: string, pluginId: string): Promise<Record<string, unknown>>;
}
/** The consumer-facing settings accessor — already scoped to the event's org. */
export interface ConsumerSettingsReader {
    /** Decrypted settings for `pluginId` in the event's organization ({} if never configured). */
    get(pluginId: string): Promise<Record<string, unknown>>;
}
/**
 * The asset operations a consumer may perform. Deliberately the *service*, not the database
 * adapter: `databaseAdapter.deleteAsset` drops the row and leaves the file in object storage,
 * which for an erasure consumer is the difference between deleting the pointer and deleting
 * the data.
 */
export interface ConsumerAssetService {
    findAssetById(organizationId: string, id: string): Promise<unknown>;
    deleteAsset(organizationId: string, id: string): Promise<boolean>;
}
/** What an event-consumer handler receives. `databaseAdapter` is the live adapter (org-scoped calls take an org id). */
export interface EventConsumerContext {
    event: ConsumedEvent;
    databaseAdapter: DatabaseAdapter;
    logger: Logger;
    /** Assets in the event's organization, file included. `null` when the host wired none. */
    assetService: ConsumerAssetService | null;
    /** Read this plugin's own decrypted settings for the event's org (e.g. a webhook URL secret). */
    settings: ConsumerSettingsReader;
    /**
     * The configured email adapter, or `null` when the app has no email configured. A consumer that
     * sends notifications (e.g. a form's "new submission" email) must handle `null` — treat it as
     * "email disabled" and skip, never throw, so a missing key doesn't dead-letter the delivery.
     */
    emailAdapter: EmailAdapter | null;
}
/** Runtime services the consumer wrapper injects into each delivery's context. */
export interface ConsumerHandlerDeps {
    pluginSettingsService: PluginSettingsReader;
    /** The app's asset service, passed through to consumers that erase or rewrite media. */
    assetService?: ConsumerAssetService | null;
    /** The app's email adapter (or `null` if email isn't configured). Passed straight to the consumer. */
    emailAdapter?: EmailAdapter | null;
}
/**
 * Runs when a subscribed event fires. Resolve to ack the delivery; throw to retry it (with
 * backoff, until the delivery job's attempts are exhausted, then dead-letter). MUST be
 * idempotent: at-least-once delivery means it can run more than once for the same event.
 */
export type EventConsumerHandler = (ctx: EventConsumerContext) => Promise<void>;
/**
 * Reserved job-type prefix for consumer deliveries. Namespaced so a delivery job can never
 * collide with a document job or a plugin's own `aphex/job/handler` type. The relay enqueues
 * `consumerJobType(id)`; the resolver registers the matching handler under the same key.
 */
export declare const CONSUMER_JOB_PREFIX = "aphex/consumer:";
/** The delivery job type for a consumer id. */
export declare function consumerJobType(consumerId: string): string;
/** Build the delivery job payload for an event (the relay's side of the envelope). */
export declare function toDeliveryPayload(event: ConsumedEvent): Record<string, unknown>;
/**
 * Adapt an `EventConsumerHandler` into a `JobHandler`. The runner calls the returned function
 * with a claimed delivery job; it reconstructs the `ConsumedEvent` from the job payload, binds
 * a settings reader to the event's org, and invokes the consumer. Throwing propagates to the
 * runner as a retryable failure. `deps` is injected by the runner (`runJobsBatch`), which is
 * where the live services live — the resolver only knows which consumers exist, not how to run them.
 */
export declare function toConsumerJobHandler(handler: EventConsumerHandler, deps: ConsumerHandlerDeps): JobHandler;
//# sourceMappingURL=consumer.d.ts.map
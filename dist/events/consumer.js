// Event consumers — the "react to a fact" surface. A consumer subscribes to one or more
// domain-event types and runs when they fire. It is NOT called inline at emit time: the
// relay turns each event into a durable delivery *job* (one per subscribed consumer), and
// the ordinary job runner executes it — so a consumer inherits retries, backoff, and
// dead-lettering for free, and a slow/failing consumer never blocks the write that emitted
// the event.
//
// This module is the bridge between the two halves: `EventConsumerHandler` is what a plugin
// author writes; `toConsumerJobHandler` adapts it to a `JobHandler` the runner understands,
// and `consumerJobType` is the reserved job-type namespace the relay enqueues under.
import { z } from 'zod';
/**
 * Reserved job-type prefix for consumer deliveries. Namespaced so a delivery job can never
 * collide with a document job or a plugin's own `aphex/job/handler` type. The relay enqueues
 * `consumerJobType(id)`; the resolver registers the matching handler under the same key.
 */
export const CONSUMER_JOB_PREFIX = 'aphex/consumer:';
/** The delivery job type for a consumer id. */
export function consumerJobType(consumerId) {
    return `${CONSUMER_JOB_PREFIX}${consumerId}`;
}
/**
 * The delivery job's payload envelope. The relay serializes the triggering event into this
 * shape; `toConsumerJobHandler` parses it back out — parsing (not casting) so a malformed
 * payload fails loudly at the handler boundary rather than reaching consumer code as `any`.
 * `createdAt` crosses the DB as a JSON string and is coerced back to a `Date`.
 */
const deliveryEnvelope = z.object({
    event: z.object({
        id: z.string(),
        type: z.string(),
        organizationId: z.string(),
        payload: z.record(z.string(), z.unknown()).default({}),
        correlationId: z.string().nullable().default(null),
        causationId: z.string().nullable().default(null),
        createdBy: z.string().nullable().default(null),
        createdAt: z.coerce.date()
    })
});
/** Build the delivery job payload for an event (the relay's side of the envelope). */
export function toDeliveryPayload(event) {
    return {
        event: {
            id: event.id,
            type: event.type,
            organizationId: event.organizationId,
            payload: event.payload,
            correlationId: event.correlationId,
            causationId: event.causationId,
            createdBy: event.createdBy,
            createdAt: event.createdAt.toISOString()
        }
    };
}
/**
 * Adapt an `EventConsumerHandler` into a `JobHandler`. The runner calls the returned function
 * with a claimed delivery job; it reconstructs the `ConsumedEvent` from the job payload, binds
 * a settings reader to the event's org, and invokes the consumer. Throwing propagates to the
 * runner as a retryable failure. `deps` is injected by the runner (`runJobsBatch`), which is
 * where the live services live — the resolver only knows which consumers exist, not how to run them.
 */
export function toConsumerJobHandler(handler, deps) {
    return async ({ job, databaseAdapter, logger }) => {
        const { event } = deliveryEnvelope.parse(job.payload);
        const settings = {
            get: (pluginId) => deps.pluginSettingsService.get(event.organizationId, pluginId)
        };
        await handler({
            event,
            databaseAdapter,
            logger,
            settings,
            assetService: deps.assetService ?? null,
            emailAdapter: deps.emailAdapter ?? null
        });
    };
}

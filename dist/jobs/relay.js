import { consumerJobType, toDeliveryPayload } from '../events/consumer.js';
const DEFAULT_RELAY_BATCH_SIZE = 100;
/**
 * Drain one bounded batch of the outbox, fanning each event out to its subscribed consumers.
 * Runs one pass and returns — the caller (the same tick as `runJobsBatch`) owns cadence.
 */
export async function relayOutbox(services, options = {}) {
    const { databaseAdapter, logger, partResolver } = services;
    const batchSize = options.batchSize ?? DEFAULT_RELAY_BATCH_SIZE;
    const rows = await databaseAdapter.listUnprocessedOutbox({
        organizationId: options.organizationId,
        limit: batchSize
    });
    const result = { relayed: 0, enqueued: 0 };
    for (const row of rows) {
        const consumers = partResolver.consumersForEvent(row.eventType);
        // A row with no subscribers is still marked processed — the relay's contract is "every
        // event is considered", not "every event produces a job". Nobody listening is a valid
        // outcome, and leaving it pending would re-scan it forever.
        const event = {
            id: row.eventId,
            type: row.eventType,
            organizationId: row.organizationId,
            payload: row.payload,
            correlationId: row.correlationId,
            causationId: row.causationId,
            createdBy: row.createdBy,
            createdAt: row.createdAt
        };
        const payload = toDeliveryPayload(event);
        try {
            await databaseAdapter.withTransaction(async (tx) => {
                for (const consumer of consumers) {
                    await tx.scheduleJob({
                        organizationId: row.organizationId,
                        type: consumerJobType(consumer.id),
                        payload,
                        // Exactly-once per (event, consumer): a repeated key returns the existing job.
                        idempotencyKey: `evt:${row.eventId}:${consumer.id}`,
                        maxAttempts: consumer.maxAttempts,
                        correlationId: row.correlationId,
                        // The event is the cause of every delivery it spawns — chain it for tracing.
                        causationId: row.eventId,
                        createdBy: row.createdBy
                    });
                }
                await tx.markOutboxProcessed(row.organizationId, row.id);
            });
            result.relayed++;
            result.enqueued += consumers.length;
        }
        catch (err) {
            // Leave the row unprocessed; the next pass retries it. Idempotent enqueue makes a
            // partial failure safe to redo. Log and continue so one bad row can't stall the batch.
            const message = err instanceof Error ? err.message : String(err);
            logger.error('[relay]', `Failed to relay event ${row.eventId} (${row.eventType}); will retry next pass: ${message}`);
        }
    }
    return result;
}

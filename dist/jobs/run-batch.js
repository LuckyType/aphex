// The shared job-runner seam. Both the protected HTTP endpoint
// (`POST /api/internal/workers/run`) and the embedded in-process poll loop call
// THIS — never `runDueJobs` directly — so the handler wiring (built-in document
// jobs + app-registered handlers) is constructed in exactly one place and can
// never drift between the two invocation modes.
//
// `runDueJobs` is the pure engine (claim → run → settle, one batch). This wrapper
// is the only thing that knows *which* handlers exist and pulls the per-run knobs
// off `CMSConfig.jobs`.
import { randomUUID } from 'node:crypto';
import { runDueJobs } from './run-due-jobs.js';
import { relayOutbox } from './relay.js';
import { createDocumentJobHandlers } from './document-jobs.js';
import { createAssetReferenceJobHandlers } from './asset-reference-jobs.js';
import { consumerJobType, toConsumerJobHandler } from '../events/consumer.js';
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
export async function runJobsBatch(services, options = {}) {
    const { config, databaseAdapter, logger, localAPI, partResolver, pluginSettingsService } = services;
    const emailAdapter = services.emailAdapter ?? null;
    const assetService = services.assetService ?? null;
    const relay = await relayOutbox(services, {
        organizationId: options.organizationId,
        batchSize: config.jobs?.relayBatchSize
    });
    // Turn each registered consumer into a delivery job handler, keyed by its reserved job type.
    // Built here (not in the resolver) because the wrapper injects live services — the settings
    // reader that lets a consumer read its own decrypted config.
    const consumerHandlers = {};
    for (const consumer of partResolver.eventConsumers()) {
        consumerHandlers[consumerJobType(consumer.id)] = toConsumerJobHandler(consumer.handler, {
            pluginSettingsService,
            emailAdapter,
            assetService
        });
    }
    const jobs = await runDueJobs({
        databaseAdapter,
        handlers: {
            ...createDocumentJobHandlers({ localAPI }),
            ...createAssetReferenceJobHandlers({
                databaseAdapter,
                schemaTypes: config.schemaTypes ?? []
            }),
            ...consumerHandlers,
            ...partResolver.jobHandlers(),
            ...(config.jobs?.handlers ?? {})
        },
        logger,
        workerId: options.workerId ?? `runner-${randomUUID()}`,
        organizationId: options.organizationId,
        batchSize: config.jobs?.batchSize,
        leaseMs: config.jobs?.leaseMs
    });
    return { ...jobs, relay };
}

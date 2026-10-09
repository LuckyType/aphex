import { runJobsBatch } from './run-batch.js';
/**
 * Start the loop. Ticks NEVER overlap: while a tick is in flight the next interval fire is
 * skipped, so a slow batch can't stack runs on top of each other. A thrown error in a tick is
 * logged and swallowed — the loop must survive a transient DB blip and keep going. The interval
 * is `unref`'d where supported so it never keeps the process alive on its own.
 */
export function startEmbeddedJobRunner(options) {
    const intervalMs = options.intervalMs ?? 3000;
    const { logger, getServices } = options;
    let running = false;
    let stopped = false;
    const tick = async () => {
        if (running || stopped)
            return; // no overlap; nothing after stop()
        const services = getServices();
        if (!services)
            return; // not initialized yet — try again next interval
        running = true;
        try {
            const result = await runJobsBatch(services, {
                workerId: 'embedded'
            });
            // Only surface a tick that actually did something, so an idle dev server stays quiet.
            if (result.claimed > 0 || result.relay.enqueued > 0) {
                logger.debug(`[jobs:embedded] relayed=${result.relay.enqueued} claimed=${result.claimed} completed=${result.completed} failed=${result.failed} retried=${result.retried}`);
            }
        }
        catch (error) {
            logger.error('[jobs:embedded] tick failed:', error);
        }
        finally {
            running = false;
        }
    };
    const handle = setInterval(tick, intervalMs);
    // Don't let the loop hold the process open by itself (Node/Bun); harmless where unsupported.
    handle.unref?.();
    logger.info(`[jobs:embedded] in-process job loop started (every ${intervalMs}ms)`);
    return {
        stop() {
            stopped = true;
            clearInterval(handle);
        }
    };
}

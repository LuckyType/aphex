/**
 * Call once from `hooks.client.ts`. Reloads the page a single time if a code-split chunk or
 * the entry module fails to load during initial hydration, masking a transient CDN/origin
 * hiccup instead of leaving the page rendered-but-unresponsive. Does NOT cover a failed
 * client-side navigation — see `handleChunkLoadClientError` for that.
 */
export declare function installChunkLoadRecovery(): void;
/**
 * Call from `hooks.client.ts`'s exported `handleError` (SvelteKit's `HandleClientError`) with
 * the error it received and `event.url` (the destination of the failed navigation — SvelteKit
 * doesn't update `location`/the address bar until a navigation resolves, so at the moment this
 * fires the browser is still showing wherever the visitor came *from*). Covers a failed
 * client-side navigation to a lazily-loaded route — the one case `installChunkLoadRecovery`'s
 * global listeners can't see, since SvelteKit's router catches that rejection internally before
 * it ever reaches `window`.
 */
export declare function handleChunkLoadClientError(error: unknown, destinationUrl?: URL | string): void;
/**
 * Call once, at the top level of the root `+layout.svelte`'s `<script>` (must run during
 * component initialization — `beforeNavigate`/`afterNavigate` require it). Starts a `timeoutMs`
 * timer on every client-side navigation; if it hasn't finished by then, forces a hard navigation
 * to the destination instead of waiting for SvelteKit to eventually report the failure itself.
 * Shares `reloadOnce`'s session guard, so if this fires, the reactive `handleError`-based recovery
 * for the same failed navigation (which may still resolve later) is a no-op rather than a second,
 * redundant navigation.
 *
 * `timeoutMs` defaults to 4000 — several times a normal navigation's real-world latency (observed
 * consistently under 1s), generous enough to avoid pre-empting a legitimately-slow-but-working
 * request, while still bounding the worst case to seconds instead of however long the CDN/proxy's
 * own gateway timeout happens to be.
 */
export declare function installNavigationTimeoutRecovery(timeoutMs?: number): void;
//# sourceMappingURL=chunk-recovery.d.ts.map
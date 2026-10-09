import type { Plugin } from 'vite';
export interface AphexHMROptions {
    /**
     * Path segment that identifies schema files (matched against the file path).
     * Defaults to `/schemaTypes/`.
     */
    schemaDir?: string;
    /**
     * Filename of the CMS config (matched as a suffix on the changed path).
     * Defaults to `aphex.config.ts`.
     */
    configFile?: string;
    /**
     * Debounce window in ms before reacting to a schema change.
     * Editors that do atomic saves fire multiple chokidar events in quick
     * succession; debouncing collapses them into a single reload.
     * Defaults to 150.
     */
    debounceMs?: number;
    /**
     * How to refresh the CMS engine on schema change.
     * - `'swap'` (default): re-load `aphex.config.ts` via Vite's SSR loader and
     *   hand it to cms-core's HMR setter. The Vite dev server keeps running;
     *   only the engine's config is replaced. ~10x faster than restart.
     * - `'restart'`: tear down and rebuild the Vite dev server. Slower but
     *   guarantees every server module re-evaluates from scratch.
     */
    mode?: 'swap' | 'restart';
}
export interface AphexTypegenOptions {
    /** Schema entry passed to `aphex generate:types`. Default `src/lib/schemaTypes/index.ts`. */
    schema?: string;
    /** Output file for the generated types. Default `src/lib/generated-types.ts`. */
    output?: string;
    /**
     * Client-safe plugin registry (exporting `plugins`), passed to `aphex generate:types`
     * so plugin schema-transforms run during codegen — e.g. a plugin `type: 'color'`
     * desugars into its object shape instead of generating as `unknown`.
     * Default `src/lib/plugins.ts`; pass `false` to skip.
     */
    plugins?: string | false;
    /** Regenerate once when the dev server starts (catches edits made while it was down). Default `true`. */
    runOnStart?: boolean;
}
export interface AphexOptions {
    /** HMR plugin options. Pass `false` to disable schema HMR. */
    hmr?: AphexHMROptions | false;
    /** Auto type-generation options. Pass `false` to disable regenerating types on schema change. */
    typegen?: AphexTypegenOptions | false;
    /** Disable the dayjs ESM alias redirect. */
    dayjs?: boolean;
    /** Disable the SSR noExternal/external defaults for cms-core/ui packages. */
    ssr?: boolean;
    /** Disable the optimizeDeps include/exclude defaults. */
    optimizeDeps?: boolean;
    /** Disable the watch unfilter for in-monorepo Aphex package edits. */
    watch?: boolean;
}
/**
 * Watches the CMS config and schema files in dev. When any of them change,
 * the plugin re-loads `aphex.config.ts` via Vite's SSR loader (so the fresh
 * module re-runs the schema imports) and hands the new config to cms-core's
 * `__notifyAphexConfigChanged()` setter — the engine then re-initializes on
 * the next request without restarting the Vite dev server.
 *
 * Why this works without races:
 * - `server.ssrLoadModule` is Vite's official re-eval path, no cache-bust hacks
 * - The plugin and the running SvelteKit hook share the same cms-core module
 *   instance through Vite's module graph, so the setter mutates the same
 *   `activeConfig` the hook reads on each request
 * - A single mutation point (`__notifyAphexConfigChanged`) replaces the old
 *   global dirty-flag protocol; no two-step set-then-read race window
 *
 * Falls back to `server.restart()` automatically if the swap throws (e.g.
 * the user introduced a syntax error in their schema). `mode: 'restart'`
 * forces the slower-but-most-correct path on every change.
 */
export declare function aphexHMR(options?: AphexHMROptions): Plugin;
/**
 * One-stop Vite plugin for AphexCMS apps. Bundles:
 *
 * - schema HMR (hot-swap the engine config on change)
 * - auto type-generation (regenerate generated-types.ts when a schema file changes)
 * - dayjs ESM alias redirect
 * - SSR noExternal/external defaults for cms-core/ui packages
 * - optimizeDeps tuning so first-render isn't slowed by lazy dep discovery
 * - watcher un-ignore for in-monorepo Aphex package edits
 *
 * Each piece can be opted out individually. Returns an array of plugins so
 * Vite can attach each one separately and keep diagnostics readable.
 *
 * Usage:
 *
 * ```ts
 * // vite.config.ts
 * import { aphex } from '@aphexcms/cms-core/vite';
 *
 * export default defineConfig({
 *   plugins: [tailwindcss(), sveltekit(), aphex()]
 * });
 * ```
 */
export declare function aphex(options?: AphexOptions): Plugin[];
//# sourceMappingURL=index.d.ts.map
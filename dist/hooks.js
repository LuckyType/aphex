import { handleAuthHook } from './auth/auth-hooks.js';
import { aphexLocals } from './auth/locals.js';
import { getPreviewPerspective } from './preview/perspective.js';
import { resolveCapabilities } from './types/capabilities.js';
import { cmsLogger, setLogLevel, setLogger } from './utils/logger.js';
import { createStorageAdapter as createStorageAdapterProvider } from './storage/providers/storage.js';
import { AssetService as AssetServiceClass } from './services/asset-service.js';
import { resolveImageConfig } from './images/variants.js';
import { resolveGlobalAllowedMimeTypes } from './utils/file-accept.js';
import { RolesService } from './services/roles-service.js';
import { PluginSettingsService } from './services/plugin-settings-service.js';
import { createCMS } from './engine.js';
import { createLocalAPI } from './local-api/index.js';
import { createPartResolver } from './plugins/resolver.js';
import { startEmbeddedJobRunner } from './jobs/embedded-runner.js';
import { createAphexApi, mountAphexBuiltins, toHonoHandler } from './server/api/index.js';
/**
 * Wrap a plugin route handler so it enforces `requiredCapabilities` before running.
 * 401 when there's no authenticated principal at all; 403 when authenticated but
 * missing a required capability. Uses the same server-resolved capability set every
 * core resource checks — the client can't forge it.
 */
function gateHandler(handler, required) {
    return (c) => {
        const auth = c.var.auth;
        if (!auth || auth.type === 'partial_session') {
            return c.json({ success: false, error: 'Authentication required' }, 401);
        }
        const caps = resolveCapabilities(auth);
        const missing = required.filter((cap) => !caps.has(cap));
        if (missing.length > 0) {
            return c.json({ success: false, error: 'Insufficient permissions', missingCapabilities: missing }, 403);
        }
        return handler(c);
    };
}
let cmsInstances = null;
let schemaError = null;
let initPromise = null;
let activeConfig = null;
let configDirty = false;
// Started once per process (not per request, and not restarted on schema-HMR re-init): the loop
// resolves the live `cmsInstances` at each tick, so a rebuilt instance is picked up automatically.
let embeddedRunner = null;
/**
 * Called by the Vite HMR plugin (`@aphexcms/cms-core/vite`) when schema
 * files or `aphex.config.ts` change. Replaces the captured config with the
 * freshly re-evaluated module and marks instances for re-initialization on
 * the next request — no Vite dev-server restart required.
 *
 * Module-level state means the Vite plugin and the running SvelteKit hook
 * share the same cms-core instance through Vite's module graph, so this
 * setter mutates the same `activeConfig` the hook reads on each request.
 */
export function __notifyAphexConfigChanged(newConfig) {
    activeConfig = newConfig;
    configDirty = true;
}
function checkSchemasDirty() {
    if (!configDirty)
        return false;
    configDirty = false;
    return true;
}
// Factory function to create the default local storage adapter
function createDefaultStorageAdapter() {
    return createStorageAdapterProvider('local', {
        basePath: './storage/assets', // Private storage - not in static/, not served in production
        baseUrl: '' // No direct URL - all access through /assets/{id}/{filename}
    });
}
export function createCMSHook(config) {
    if (!config) {
        throw new Error('[CMS] createCMSHook received an undefined config. ' +
            'If this happens during HMR, the config module may not have re-executed yet.');
    }
    if (config.logger)
        setLogger(config.logger);
    if (config.logLevel)
        setLogLevel(config.logLevel);
    // Stash the config in module scope so the HMR plugin can replace it via
    // __notifyAphexConfigChanged() without going through this factory again.
    activeConfig = config;
    return async ({ event, resolve }) => {
        // Use the latest config that the HMR plugin handed us; falls back to
        // the one captured at hook construction time.
        const currentConfig = activeConfig ?? config;
        // Note: In dev mode, /storage/ might be accessible via Vite dev server
        // In production, only /static/ folder is served - /storage/ is private
        // Initialize CMS instances once at application startup
        // Use a promise lock to prevent concurrent requests from racing initialization.
        // Also reset before the init check so a schema HMR or a sticky schemaError
        // falls through into fresh init on THIS request (not next one) — otherwise
        // locals.aphexCMS would be null for the requesting handler.
        if (cmsInstances && (checkSchemasDirty() || schemaError)) {
            cmsLogger.info('[CMS]', 'Schema change detected, re-initializing...');
            if (cmsInstances.config.cache) {
                cmsInstances.config.cache.flush();
            }
            cmsInstances = null;
            schemaError = null;
            initPromise = null;
        }
        if (initPromise) {
            await initPromise;
        }
        if (!cmsInstances) {
            let resolveInit;
            initPromise = new Promise((r) => (resolveInit = r));
            cmsLogger.info('[CMS]', 'Initializing...');
            const databaseAdapter = currentConfig.database;
            // Use the storage adapter from config, or create the default local one.
            const storageAdapter = currentConfig.storage ?? createDefaultStorageAdapter();
            const emailAdapter = currentConfig.email ?? null;
            const aiProvider = currentConfig.aiProvider ?? null;
            const assetService = new AssetServiceClass(storageAdapter, databaseAdapter, resolveImageConfig(currentConfig.images), resolveGlobalAllowedMimeTypes({ config: currentConfig }));
            const cmsEngine = createCMS(currentConfig, databaseAdapter);
            const rolesService = new RolesService(databaseAdapter, currentConfig.cache ?? null);
            // Initialize Local API (unified operations layer)
            const localAPI = createLocalAPI(currentConfig, databaseAdapter);
            // Build the Hono API app shell. User middleware/overrides register
            // FIRST (so they sit ahead of built-ins in the chain), then we mount
            // the built-in routes, then GraphQL.
            // Index plugin parts (validates duplicate part ids). Mount plugin server
            // routes after the user's `api` hook and before built-ins, so a plugin's
            // `POST /bookings` becomes `POST /api/bookings`, overridable by the app.
            const partResolver = createPartResolver(currentConfig.plugins ?? []);
            // Per-(org, plugin) config store — merges declared defaults with stored
            // values and writes edits back, scoped to the org. The encryption key gates
            // `secret` fields (absent → secrets disabled, fail safe).
            const pluginSettingsService = new PluginSettingsService(databaseAdapter, partResolver, currentConfig.security?.secretEncryptionKey ?? null);
            const apiApp = createAphexApi();
            currentConfig.api?.(apiApp);
            for (const route of partResolver.serverRoutes()) {
                // Gate every plugin route by its declared `requiredCapabilities` before the
                // handler runs, so a declared capability is ENFORCED rather than merely
                // documented. `'public'` is the single ungated path and the author had to
                // write it: an empty list still requires authentication, and omitting the
                // field entirely doesn't type-check. Ungated is therefore always a choice,
                // never an oversight.
                const handler = route.requiredCapabilities === 'public'
                    ? route.handler
                    : gateHandler(route.handler, route.requiredCapabilities);
                apiApp.on(route.method, route.path, handler);
            }
            mountAphexBuiltins(apiApp);
            // Initialize schemas with validation
            try {
                await cmsEngine.initialize();
            }
            catch (error) {
                cmsLogger.error('[CMS]', 'Failed to initialize:', error);
                schemaError = error instanceof Error ? error : new Error(String(error));
            }
            // Initialize built-in GraphQL (enabled by default, opt-out with graphql: false)
            let graphqlSettings = null;
            if (currentConfig.graphql !== false) {
                try {
                    const { createGraphQLHandler } = await import('./graphql/index.js');
                    const graphqlConfig = typeof currentConfig.graphql === 'object' ? currentConfig.graphql : {};
                    const result = await createGraphQLHandler({
                        config: currentConfig,
                        databaseAdapter,
                        assetService,
                        storageAdapter,
                        emailAdapter,
                        cmsEngine,
                        localAPI,
                        rolesService,
                        pluginSettingsService,
                        logger: cmsLogger,
                        auth: currentConfig.auth?.provider,
                        apiApp,
                        partResolver
                    }, currentConfig.schemaTypes, graphqlConfig);
                    // Register GraphQL directly on the Hono app. The Yoga handler
                    // internally distinguishes GET (GraphiQL UI) from POST (queries),
                    // so we mount with `app.all()` and let it route by method.
                    //
                    // Path is normalized to be relative to the `/api` basePath:
                    // e.g. config path "/api/graphql" → mount at "/graphql".
                    const rawPath = graphqlConfig.path ?? '/api/graphql';
                    const fullPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
                    const honoPath = fullPath.startsWith('/api')
                        ? fullPath.slice('/api'.length) || '/'
                        : fullPath;
                    apiApp.all(honoPath, toHonoHandler(result.handler));
                    graphqlSettings = result.settings;
                }
                catch (error) {
                    cmsLogger.error('[CMS]', 'Failed to initialize GraphQL:', error);
                    // Non-fatal: CMS works without GraphQL
                }
            }
            cmsInstances = {
                config: currentConfig,
                databaseAdapter: databaseAdapter,
                assetService: assetService,
                storageAdapter: storageAdapter,
                emailAdapter: emailAdapter,
                aiProvider: aiProvider,
                cmsEngine: cmsEngine,
                localAPI: localAPI,
                rolesService,
                pluginSettingsService,
                logger: cmsLogger,
                auth: currentConfig.auth?.provider,
                graphqlSettings,
                apiApp,
                partResolver
            };
            // Start the embedded in-process job loop once, if opted in. It drives the queue
            // directly (no HTTP, no worker secret) so scheduled publishes and event consumers
            // run with zero setup — ideal for dev and single-instance self-hosting. It reads
            // the live `cmsInstances` at each tick, so it survives schema-HMR re-init.
            if (currentConfig.jobs?.embedded && !embeddedRunner) {
                embeddedRunner = startEmbeddedJobRunner({
                    intervalMs: currentConfig.jobs.embeddedIntervalMs,
                    logger: cmsLogger,
                    getServices: () => cmsInstances
                });
            }
            resolveInit();
        }
        // Attach schema error to instances so it can be accessed in load functions
        if (cmsInstances) {
            cmsInstances.schemaError = schemaError;
        }
        // Inject shared CMS services into locals (reuse singleton instances)
        event.locals.aphexCMS = cmsInstances;
        // Auth protection if configured
        if (cmsInstances.auth) {
            const authResponse = await handleAuthHook(event, currentConfig, cmsInstances.auth, cmsInstances.databaseAdapter, cmsInstances.rolesService);
            if (authResponse)
                return authResponse;
        }
        // Resolve the read perspective once per request so site loads inherit it
        // (published normally / draft in an authenticated `?aphex-preview` session)
        // via `locals.previewPerspective` — no per-load wiring. Apps can override the
        // policy with `config.preview.resolvePerspective`.
        event.locals.previewPerspective =
            currentConfig.preview?.resolvePerspective?.({
                auth: aphexLocals(event.locals).auth,
                url: event.url
            }) ?? getPreviewPerspective(aphexLocals(event.locals).auth, event.url);
        return resolve(event);
    };
}

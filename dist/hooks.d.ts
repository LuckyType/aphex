import type { Handle } from '@sveltejs/kit';
import type { Hono } from 'hono';
import type { CMSConfig } from './types/index.js';
import type { DatabaseAdapter } from './db/index.js';
import type { AssetService } from './services/asset-service.js';
import type { StorageAdapter } from './storage/interfaces/storage.js';
import type { EmailAdapter } from './email/index.js';
import type { AIProviderAdapter } from './ai/index.js';
import type { AuthProvider } from './auth/provider.js';
import type { GraphQLSettings } from './graphql/index.js';
import type { Logger } from './utils/logger.js';
import { RolesService } from './services/roles-service.js';
import { PluginSettingsService } from './services/plugin-settings-service.js';
import { CMSEngine } from './engine.js';
import { type LocalAPI } from './local-api/index.js';
import { type PartResolver } from './plugins/resolver.js';
import { type AphexEnv } from './server/api/index.js';
export interface CMSInstances {
    config: CMSConfig;
    assetService: AssetService;
    storageAdapter: StorageAdapter;
    databaseAdapter: DatabaseAdapter;
    emailAdapter?: EmailAdapter | null;
    aiProvider?: AIProviderAdapter | null;
    cmsEngine: CMSEngine;
    localAPI: LocalAPI;
    rolesService: RolesService;
    /** Per-(org, plugin) settings store — the config plane for plugins. */
    pluginSettingsService: PluginSettingsService;
    logger: Logger;
    auth?: AuthProvider;
    graphqlSettings?: GraphQLSettings | null;
    apiApp: Hono<AphexEnv>;
    /** Indexed plugin parts (routes, document actions, admin tools, field components). */
    partResolver: PartResolver;
}
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
export declare function __notifyAphexConfigChanged(newConfig: CMSConfig): void;
export declare function createCMSHook(config: CMSConfig): Handle;
//# sourceMappingURL=hooks.d.ts.map
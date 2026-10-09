// Aphex CMS Core - Server-side exports
// These require Node.js and should NOT be imported client-side
// Export all core types from the new central location
export * from '../types/index.js';
export * from '../auth/provider.js';
export * from '../cache/index.js';
export * from '../email/index.js';
export * from '../ai/index.js';
// Authentication errors
export { AuthError } from '../auth/auth-errors.js';
export { isInstanceEmpty, canDetermineInstanceEmptiness } from '../auth/instance-state.js';
export * from '../auth/bootstrap.js';
export * from '../auth/sign-up-policy.js';
export * from '../auth/account-deletion.js';
// Configuration system
export { createCMSConfig } from '../config.js';
// Adapter health, for the app's own `/healthz` probe route
export { checkHealth } from './health.js';
// Logger
export { cmsLogger, setLogger } from '../utils/logger.js';
export { DEFAULT_ALLOWED_MIME_TYPES } from '../utils/file-accept.js';
// CMS Engine
export { CMSEngine } from '../engine.js';
// Hooks integration (SvelteKit server hooks)
export { createCMSHook, __notifyAphexConfigChanged } from '../hooks.js';
// Database interfaces (no longer export registry or adapters - use adapter packages)
// Plain constants and pure helpers — no imports of their own, so this adds
// nothing to any chunk that already touches this barrel.
export * from '../api/limits.js';
export * from '../api/docs-ui.js';
export * from '../images/index.js';
export * from '../db/interfaces/index.js';
// Storage adapters and interfaces
export * from '../storage/index.js';
export * from '../storage/interfaces/index.js';
export * from '../storage/providers/storage.js';
// Services (includes sharp for image processing)
export * from '../services/index.js';
export { AssetService } from '../services/asset-service.js';
export { RolesService } from '../services/roles-service.js';
// CDN handler — re-exported for the studio/template `media/[id]/[filename]/
// +server.ts` shim. Lives outside `/api` (URLs are baked into published
// documents, can't move onto the catch-all without breaking links).
export { GET as serveAssetCDN } from '../routes/assets-cdn.js';
// Hono API app — exposed so user apps (and tests) can construct or extend
// the same router the SK catch-all forwards to.
export { createAphexApi, mountAphexBuiltins, toHonoHandler } from './api/index.js';
// Fixed-window throttle for unauthenticated endpoints. Exposed because an app adding its own
// public route needs the same guard the password-reset facades use — and because the caveat
// travels with it: this is per-process memory, so N instances give N× the configured limit.
export { RateLimiter, clientAddress } from './api/rate-limit.js';
// Job execution — the DB-backed job runner (claim → run handler → complete/retry/fail).
export * from '../jobs/index.js';
// Schema utilities
export * from '../schema-utils/index.js';
// Content hash utilities (server-side)
export { createHashForPublishing } from '../utils/content-hash.js';
// Signed asset URLs — how an app hands a private asset to a viewer who has no
// admin session. Server-only: minting one requires the signing secret.
export { signAssetUrl, verifyAssetSignature, DEFAULT_ASSET_URL_TTL_SECONDS, ASSET_SIGNATURE_PARAM, ASSET_EXPIRY_PARAM } from '../utils/asset-url-signing.js';
// Preview utilities
export { getPreviewPerspective } from '../preview/perspective.js';
// GraphQL (built-in, enabled by default)
export { createGraphQLHandler } from '../graphql/index.js';
// Local API (unified operations layer)
export { LocalAPI, createLocalAPI, getLocalAPI, CollectionAPI, SingletonOperationError, DocumentValidationError, PermissionChecker, PermissionError, authToContext, requireAuth, systemContext } from '../local-api/index.js';
// MCP — transport-agnostic tool registry (the MCP route + a future AI panel
// both consume these). The SvelteKit route handler is at ./routes/mcp.
export { buildContentTools } from '../mcp/tools.js';

import { Hono } from 'hono';
import type { CMSInstances } from '../../hooks.js';
import type { Auth } from '../../types/auth.js';
/**
 * Hono environment for the Aphex API.
 *
 * Variables on `c.var`:
 * - `aphexCMS` — the singleton CMS service container (db, storage, services).
 * - `auth` — the resolved auth principal for this request, or null if anonymous.
 *
 * These are populated by the SvelteKit catch-all, which invokes
 * `app.fetch(request, { aphexCMS, auth })` and the bridge middleware below
 * lifts them onto `c.var`.
 */
export type AphexEnv = {
    Variables: {
        aphexCMS: CMSInstances;
        auth: Auth | null;
    };
    Bindings: {
        aphexCMS: CMSInstances;
        auth: Auth | null;
        /** Set by the framework bridge from its trusted connection metadata. */
        clientAddress?: string;
    };
};
/**
 * Build the Aphex API Hono app shell.
 *
 * Returns a Hono app with `/api` basePath and the bridge middleware that
 * lifts `app.fetch(req, env)` values onto `c.var`. Built-in routes are NOT
 * mounted yet — call `mountAphexBuiltins(app)` after registering any user
 * middleware/overrides (Hono is registration-order-strict).
 */
export declare function createAphexApi(): import("hono/hono-base").HonoBase<AphexEnv, import("hono/types").BlankSchema, "/api", "/api">;
/**
 * Mount cms-core's built-in resource routes onto an Aphex API app.
 *
 * Called by `createCMSHook` after `config.api?.(app)` runs, so user-provided
 * middleware (e.g. an email-sending wrap on `/organizations/invitations`)
 * registers ahead of the built-in handler and gets the chance to wrap it.
 */
export declare function mountAphexBuiltins(app: Hono<AphexEnv>): void;
export type ApiRoutes = ReturnType<typeof createAphexApi>;
/**
 * Adapter: wrap a SvelteKit-style `RequestHandler` so it can be mounted
 * onto a Hono router.
 *
 * Used for handlers that already exist in SK form (e.g. the built-in
 * GraphQL Yoga app) and don't need to be rewritten just to flow through
 * the Hono catch-all. We synthesize the minimum `event` shape those
 * handlers actually read: `request` + `locals.{aphexCMS,auth}` + `params`
 * + `url`. If a future SK handler reaches for `cookies`, `setHeaders`, or
 * `getClientAddress`, extend the synthesized event accordingly.
 */
export declare function toHonoHandler(skHandler: (event: any) => Promise<Response> | Response): (c: import("hono").Context<AphexEnv>) => Promise<Response>;
//# sourceMappingURL=index.d.ts.map
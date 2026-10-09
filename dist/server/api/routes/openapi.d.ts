import { Hono } from 'hono';
import type { AphexEnv } from '../index.js';
/**
 * `GET /api/openapi.json` — the spec for *this* instance.
 *
 * Generated per request rather than served from a file, because half of it only
 * exists at runtime: the per-collection document shapes come from
 * `cmsEngine.config.schemaTypes`. A checked-in file would describe `draftData`
 * as an untyped record forever.
 *
 * Authenticated (see `protectedApiRoutes` in `auth/auth-hooks.ts`): the document
 * enumerates this deployment's entire content model, which is not something to
 * hand to anonymous callers even though no content is included.
 *
 * Not cached: generation is pure object-building over schemas already in memory,
 * and a stale spec after a schema change is worse than the microseconds saved.
 */
export declare const openapiRouter: Hono<AphexEnv>;
/**
 * `GET /api/docs` — a rendered reference for the spec above.
 *
 * Scalar rather than Swagger UI: it reads OpenAPI 3.1 natively (Swagger UI still
 * treats 3.1 as a best-effort downgrade, and 3.1 is what `z.toJSONSchema` emits
 * cleanly), and it's a single script tag with no build step.
 *
 * Authenticated, though the page carries no content of its own. Two reasons: an
 * unauthenticated visitor can't read `/api/openapi.json` anyway, so they'd get a
 * shell that fails to load its document and renders a cryptic error; and an
 * Aphex-branded API console answering on every content site is a fingerprint
 * nobody asked for. Signed out, this redirects to the login page — which says
 * what happened, unlike a 401 rendered inside a spec viewer.
 */
export declare const openapiDocsRouter: Hono<AphexEnv>;
//# sourceMappingURL=openapi.d.ts.map
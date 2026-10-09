/**
 * The route registry — what each mounted endpoint *is*, next to the zod schema
 * that already governs it.
 *
 * This is the one hand-maintained artifact in the OpenAPI pipeline, and it exists
 * because the schemas alone can't say which path they belong to. Everything else
 * (properties, types, required-ness, enums) is derived, so the only thing that can
 * rot here is a missing or stale *row* — which `tests/openapi-registry.test.ts`
 * catches by diffing these keys against Hono's own `app.routes`. Add a route
 * without a row and that test fails.
 *
 * `request`/`query` point at the live zod objects the handler validates with, so a
 * contract change shows up in the spec without anyone editing this file.
 */
import type { ZodType } from 'zod';
/** How a route answers to a read-only API key. See `auth/auth-hooks.ts`. */
export type AuthMode = 
/** Session or API key; a read-only key is accepted. */
'read'
/** Session or API key; a read-only key gets 403. */
 | 'write'
/** Read-shaped, but uses POST for a complex payload — read-only keys pass. */
 | 'read-via-post'
/** No credentials required. */
 | 'public'
/** Session cookie only — API keys are rejected by the handler. */
 | 'session'
/** Machine-to-machine, gated on a shared secret rather than user auth. */
 | 'secret';
export interface RouteMeta {
    /** Hono path as mounted, e.g. `/api/documents/:id`. */
    path: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    summary: string;
    description?: string;
    tag: string;
    auth: AuthMode;
    /** Zod object validating the JSON request body. */
    request?: ZodType;
    /** Zod object validating the query string. */
    query?: ZodType;
    /** Zod object describing the success response, where one exists. */
    response?: ZodType;
    /** Set for endpoints whose body is `multipart/form-data`, not JSON. */
    formData?: {
        fields: Record<string, {
            type: string;
            format?: string;
            description?: string;
        }>;
    };
    /**
     * Replace the generated schema for named body properties.
     *
     * For fields the zod contract deliberately leaves as `z.unknown()` because
     * something downstream validates them — `where` and `select` on the query
     * endpoint, parsed by `LocalAPI.find()`. Converting `z.unknown()` yields `{}`,
     * which is accurate and useless.
     */
    bodyOverrides?: Record<string, Record<string, unknown>>;
    /** A worked request body, shown in place of a generated one. */
    requestExample?: unknown;
    /**
     * For `/api/documents` writes: the request body's document payload is
     * per-collection, so the generator expands it into a `oneOf` over
     * `<Type>Data` components instead of leaving `Record<string, unknown>`.
     */
    expandDocumentData?: boolean;
}
export declare const ROUTE_REGISTRY: RouteMeta[];
/** `METHOD path` key, matching the shape of Hono's `app.routes` entries. */
export declare function routeKey(method: string, path: string): string;
/**
 * What each tag groups, for the rendered doc's section headers. Keyed by the
 * `tag` values used above; a tag without an entry still renders, just bare.
 */
export declare const TAG_DESCRIPTIONS: Record<string, string>;
//# sourceMappingURL=registry.d.ts.map
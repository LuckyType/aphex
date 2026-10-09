import { Hono } from 'hono';
import type { AphexEnv } from '../index.js';
/**
 * Roles router. Combines `/roles` (list, create) and `/roles/:name`
 * (update, delete) so the wire URLs are
 * `/api/roles` and `/api/roles/:name`.
 *
 * Note: built-in role names cannot be deleted; they're seeded on every
 * org and a custom row with the same name would be unreachable.
 */
export declare const rolesRouter: Hono<AphexEnv>;
//# sourceMappingURL=roles.d.ts.map
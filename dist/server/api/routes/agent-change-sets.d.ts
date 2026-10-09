import { Hono } from 'hono';
import { z } from 'zod';
import type { AphexEnv } from '../index.js';
/** Exported for the OpenAPI registry — see the note in `routes/jobs.ts`. */
export declare const listChangeSetsQuery: z.ZodObject<{
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const agentChangeSetsRouter: Hono<AphexEnv>;
//# sourceMappingURL=agent-change-sets.d.ts.map
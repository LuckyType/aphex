import { Hono } from 'hono';
import { z } from 'zod';
import type { AphexEnv } from '../index.js';
export declare const listJobsQuery: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        leased: "leased";
        completed: "completed";
        failed: "failed";
        cancelled: "cancelled";
    }>>;
    type: z.ZodOptional<z.ZodString>;
    scope: z.ZodOptional<z.ZodEnum<{
        all: "all";
        organization: "organization";
    }>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const listEventsQuery: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    scope: z.ZodOptional<z.ZodEnum<{
        all: "all";
        organization: "organization";
    }>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const healthQuery: z.ZodObject<{
    scope: z.ZodOptional<z.ZodEnum<{
        all: "all";
        organization: "organization";
    }>>;
}, z.core.$strip>;
export declare const jobsRouter: Hono<AphexEnv>;
//# sourceMappingURL=jobs.d.ts.map
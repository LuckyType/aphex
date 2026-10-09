import { z } from 'zod';
/**
 * Body for both operator actions on a job.
 *
 * `organizationId` exists solely for the instance-wide view: a super admin looking at every
 * tenant's queue needs to act on a job that isn't in their *active* org, and the id alone
 * doesn't say where it lives. Omit it and the action targets the caller's active organization
 * — which is the only thing a non-super-admin may ever do (the route rejects a mismatch with
 * 403 rather than trusting the body).
 */
export declare const jobActionRequestSchema: z.ZodObject<{
    organizationId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type JobActionRequest = z.infer<typeof jobActionRequestSchema>;
//# sourceMappingURL=jobs.d.ts.map
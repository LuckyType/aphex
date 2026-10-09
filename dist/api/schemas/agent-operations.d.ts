import { z } from 'zod';
export declare const recordWorkspaceOperationRequest: z.ZodObject<{
    changeSetId: z.ZodString;
    toolName: z.ZodString;
    collection: z.ZodString;
    id: z.ZodString;
    success: z.ZodBoolean;
    error: z.ZodOptional<z.ZodString>;
    arguments: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    data: z.ZodOptional<z.ZodUnknown>;
}, z.core.$strip>;
export type RecordWorkspaceOperationRequest = z.infer<typeof recordWorkspaceOperationRequest>;
//# sourceMappingURL=agent-operations.d.ts.map
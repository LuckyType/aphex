import { z } from 'zod';
export declare const capabilitySchema: z.ZodString;
export declare const createRoleRequest: z.ZodPipe<z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    capabilities: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strip>, z.ZodTransform<{
    capabilities: string[];
    name: string;
    description?: string | null | undefined;
}, {
    name: string;
    capabilities: string[];
    description?: string | null | undefined;
}>>;
export declare const updateRoleRequest: z.ZodPipe<z.ZodObject<{
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    capabilities: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>, z.ZodTransform<{
    capabilities: string[] | undefined;
    description?: string | null | undefined;
}, {
    description?: string | null | undefined;
    capabilities?: string[] | undefined;
}>>;
export type CreateRoleRequest = z.infer<typeof createRoleRequest>;
export type UpdateRoleRequest = z.infer<typeof updateRoleRequest>;
//# sourceMappingURL=roles.d.ts.map
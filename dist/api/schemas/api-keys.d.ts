import { z } from 'zod';
export declare const apiKeyPermissionSchema: z.ZodEnum<{
    read: "read";
    write: "write";
}>;
export declare const apiKeyCapabilitySchema: z.ZodString;
export declare const createApiKeyRequest: z.ZodPipe<z.ZodObject<{
    name: z.ZodString;
    permissions: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        read: "read";
        write: "write";
    }>>>;
    capabilities: z.ZodOptional<z.ZodArray<z.ZodString>>;
    expiresInDays: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>, z.ZodTransform<{
    permissions: ("read" | "write")[] | undefined;
    capabilities: string[] | undefined;
    name: string;
    expiresInDays?: number | undefined;
}, {
    name: string;
    permissions?: ("read" | "write")[] | undefined;
    capabilities?: string[] | undefined;
    expiresInDays?: number | undefined;
}>>;
export type ApiKeyPermission = z.infer<typeof apiKeyPermissionSchema>;
export type ApiKeyCapability = z.infer<typeof apiKeyCapabilitySchema>;
export type CreateApiKeyRequest = z.infer<typeof createApiKeyRequest>;
//# sourceMappingURL=api-keys.d.ts.map
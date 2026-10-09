import { z } from 'zod';
export declare const updateUserRequest: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    image: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const updateUserPreferencesRequest: z.ZodObject<{
    includeChildOrganizations: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
export declare const requestPasswordResetRequest: z.ZodObject<{
    email: z.ZodString;
    redirectTo: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const resetPasswordRequest: z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
}, z.core.$strip>;
export type UpdateUserRequest = z.infer<typeof updateUserRequest>;
export type UpdateUserPreferencesRequest = z.infer<typeof updateUserPreferencesRequest>;
export type RequestPasswordResetRequest = z.infer<typeof requestPasswordResetRequest>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequest>;
//# sourceMappingURL=user.d.ts.map
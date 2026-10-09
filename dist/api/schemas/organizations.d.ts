import { z } from 'zod';
export declare const organizationRoleSchema: z.ZodString;
export declare const invitableRoleSchema: z.ZodString;
export declare const createOrganizationRequest: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    parentOrganizationId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateOrganizationRequest: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
}, z.core.$strip>;
export declare const switchOrganizationRequest: z.ZodObject<{
    organizationId: z.ZodString;
}, z.core.$strip>;
export declare const inviteMemberRequest: z.ZodObject<{
    email: z.ZodString;
    role: z.ZodString;
}, z.core.$strip>;
export declare const cancelInvitationRequest: z.ZodObject<{
    invitationId: z.ZodString;
}, z.core.$strip>;
export declare const removeMemberRequest: z.ZodObject<{
    userId: z.ZodString;
}, z.core.$strip>;
export declare const updateMemberRoleRequest: z.ZodObject<{
    userId: z.ZodString;
    role: z.ZodString;
}, z.core.$strip>;
export type OrganizationRoleSchema = z.infer<typeof organizationRoleSchema>;
export type InvitableRoleSchema = z.infer<typeof invitableRoleSchema>;
export type CreateOrganizationRequest = z.infer<typeof createOrganizationRequest>;
export type UpdateOrganizationRequest = z.infer<typeof updateOrganizationRequest>;
export type SwitchOrganizationRequest = z.infer<typeof switchOrganizationRequest>;
export type InviteMemberRequest = z.infer<typeof inviteMemberRequest>;
export type CancelInvitationRequest = z.infer<typeof cancelInvitationRequest>;
export type RemoveMemberRequest = z.infer<typeof removeMemberRequest>;
export type UpdateMemberRoleRequest = z.infer<typeof updateMemberRoleRequest>;
//# sourceMappingURL=organizations.d.ts.map
import type { Organization, OrganizationMember, OrganizationRole } from '../types/organization.js';
import type { ApiResponse } from './types.js';
import type { CreateOrganizationRequest, UpdateOrganizationRequest, SwitchOrganizationRequest, InviteMemberRequest, UpdateMemberRoleRequest, RemoveMemberRequest, CancelInvitationRequest } from './schemas/organizations.js';
export type CreateOrganizationData = CreateOrganizationRequest;
export type UpdateOrganizationData = UpdateOrganizationRequest;
export type SwitchOrganizationData = SwitchOrganizationRequest;
export type InviteMemberData = InviteMemberRequest;
export type UpdateMemberRoleData = UpdateMemberRoleRequest;
export type RemoveMemberData = RemoveMemberRequest;
export type CancelInvitationData = CancelInvitationRequest;
export interface OrganizationListItem extends Organization {
    role: OrganizationRole;
    joinedAt: Date;
    isActive: boolean;
}
export declare class OrganizationsApi {
    /**
     * List user's organizations
     */
    static list(): Promise<ApiResponse<OrganizationListItem[]>>;
    /**
     * Create new organization (super_admin only)
     */
    static create(data: CreateOrganizationRequest): Promise<ApiResponse<Organization>>;
    /**
     * Switch to a different organization
     */
    static switch(data: SwitchOrganizationRequest): Promise<ApiResponse<{
        success: boolean;
    }>>;
    /**
     * Get organization by ID
     */
    static getById(id: string): Promise<ApiResponse<Organization>>;
    /**
     * Get active organization
     */
    static getActive(): Promise<ApiResponse<Organization>>;
    /**
     * Get organization members
     */
    static getMembers(): Promise<ApiResponse<OrganizationMember[]>>;
    /**
     * Invite a member to the organization
     */
    static inviteMember(data: InviteMemberRequest): Promise<ApiResponse<OrganizationMember>>;
    /**
     * Remove a member from the organization
     */
    static removeMember(data: RemoveMemberRequest): Promise<ApiResponse<{
        success: boolean;
    }>>;
    /**
     * Update a member's role
     */
    static updateMemberRole(data: UpdateMemberRoleRequest): Promise<ApiResponse<OrganizationMember>>;
    /**
     * Update organization settings
     */
    static update(id: string, data: UpdateOrganizationRequest): Promise<ApiResponse<Organization>>;
    /**
     * Cancel a pending invitation
     */
    static cancelInvitation(data: CancelInvitationRequest): Promise<ApiResponse<{
        success: boolean;
    }>>;
    /**
     * Delete an organization, its media, and every membership in it. Owners only —
     * enforced by the route, not here.
     */
    static remove(id: string): Promise<ApiResponse<{
        success: boolean;
    }>>;
}
export declare const organizations: {
    list: typeof OrganizationsApi.list;
    create: typeof OrganizationsApi.create;
    switch: typeof OrganizationsApi.switch;
    getById: typeof OrganizationsApi.getById;
    getActive: typeof OrganizationsApi.getActive;
    update: typeof OrganizationsApi.update;
    remove: typeof OrganizationsApi.remove;
    getMembers: typeof OrganizationsApi.getMembers;
    inviteMember: typeof OrganizationsApi.inviteMember;
    removeMember: typeof OrganizationsApi.removeMember;
    updateMemberRole: typeof OrganizationsApi.updateMemberRole;
    cancelInvitation: typeof OrganizationsApi.cancelInvitation;
};
//# sourceMappingURL=organizations.d.ts.map
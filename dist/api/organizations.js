// Organizations API client - composable organization operations
import { apiClient } from './client.js';
export class OrganizationsApi {
    /**
     * List user's organizations
     */
    static async list() {
        return apiClient.get('/organizations');
    }
    /**
     * Create new organization (super_admin only)
     */
    static async create(data) {
        return apiClient.post('/organizations', data);
    }
    /**
     * Switch to a different organization
     */
    static async switch(data) {
        return apiClient.post('/organizations/switch', data);
    }
    /**
     * Get organization by ID
     */
    static async getById(id) {
        return apiClient.get(`/organizations/${id}`);
    }
    /**
     * Get active organization
     */
    static async getActive() {
        const result = await this.list();
        const active = result.data?.find((org) => org.isActive);
        if (!active) {
            throw new Error('No active organization found');
        }
        return {
            success: true,
            data: active
        };
    }
    /**
     * Get organization members
     */
    static async getMembers() {
        return apiClient.get('/organizations/members');
    }
    /**
     * Invite a member to the organization
     */
    static async inviteMember(data) {
        return apiClient.post('/organizations/invitations', data);
    }
    /**
     * Remove a member from the organization
     */
    static async removeMember(data) {
        return apiClient.delete('/organizations/members', data);
    }
    /**
     * Update a member's role
     */
    static async updateMemberRole(data) {
        return apiClient.patch('/organizations/members', data);
    }
    /**
     * Update organization settings
     */
    static async update(id, data) {
        return apiClient.patch(`/organizations/${id}`, data);
    }
    /**
     * Cancel a pending invitation
     */
    static async cancelInvitation(data) {
        return apiClient.delete('/organizations/invitations', data);
    }
    /**
     * Delete an organization, its media, and every membership in it. Owners only —
     * enforced by the route, not here.
     */
    static async remove(id) {
        return apiClient.delete(`/organizations/${id}`);
    }
}
// Export convenience functions for direct use
export const organizations = {
    list: OrganizationsApi.list.bind(OrganizationsApi),
    create: OrganizationsApi.create.bind(OrganizationsApi),
    switch: OrganizationsApi.switch.bind(OrganizationsApi),
    getById: OrganizationsApi.getById.bind(OrganizationsApi),
    getActive: OrganizationsApi.getActive.bind(OrganizationsApi),
    update: OrganizationsApi.update.bind(OrganizationsApi),
    remove: OrganizationsApi.remove.bind(OrganizationsApi),
    getMembers: OrganizationsApi.getMembers.bind(OrganizationsApi),
    inviteMember: OrganizationsApi.inviteMember.bind(OrganizationsApi),
    removeMember: OrganizationsApi.removeMember.bind(OrganizationsApi),
    updateMemberRole: OrganizationsApi.updateMemberRole.bind(OrganizationsApi),
    cancelInvitation: OrganizationsApi.cancelInvitation.bind(OrganizationsApi)
};

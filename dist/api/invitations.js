// Invitations API client - user-scoped invitation operations
import { apiClient } from './client.js';
export class InvitationsApi {
    /**
     * List all pending invitations for the authenticated user
     */
    static async listPending() {
        return apiClient.get('/invitations');
    }
    /**
     * Accept a pending invitation
     */
    static async accept(id) {
        return apiClient.post(`/invitations/${id}/accept`);
    }
    /**
     * Reject/decline a pending invitation
     */
    static async reject(id) {
        return apiClient.post(`/invitations/${id}/reject`);
    }
}
export const invitations = {
    listPending: InvitationsApi.listPending.bind(InvitationsApi),
    accept: InvitationsApi.accept.bind(InvitationsApi),
    reject: InvitationsApi.reject.bind(InvitationsApi)
};

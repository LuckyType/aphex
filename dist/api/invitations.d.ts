import type { OrganizationRole } from '../types/organization.js';
import type { ApiResponse } from './types.js';
export interface PendingInvitation {
    id: string;
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    role: OrganizationRole;
    email: string;
    expiresAt: Date;
    createdAt: Date;
}
export interface AcceptInvitationResponse {
    organizationId: string;
}
export declare class InvitationsApi {
    /**
     * List all pending invitations for the authenticated user
     */
    static listPending(): Promise<ApiResponse<PendingInvitation[]>>;
    /**
     * Accept a pending invitation
     */
    static accept(id: string): Promise<ApiResponse<AcceptInvitationResponse>>;
    /**
     * Reject/decline a pending invitation
     */
    static reject(id: string): Promise<ApiResponse<{
        success: boolean;
    }>>;
}
export declare const invitations: {
    listPending: typeof InvitationsApi.listPending;
    accept: typeof InvitationsApi.accept;
    reject: typeof InvitationsApi.reject;
};
//# sourceMappingURL=invitations.d.ts.map
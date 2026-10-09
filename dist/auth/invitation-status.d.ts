import type { Invitation } from '../types/organization.js';
/** The minimum shape these predicates need — so callers can pass rows from any layer. */
export type InvitationState = Pick<Invitation, 'expiresAt' | 'acceptedAt'>;
/** Default lifetime for a new invitation. */
export declare const INVITATION_TTL_MS: number;
/** When a freshly-created invitation should expire. */
export declare function invitationExpiryFrom(now?: Date): Date;
export declare function isAccepted(invitation: InvitationState): boolean;
export declare function isExpired(invitation: InvitationState, now?: Date): boolean;
/**
 * Redeemable right now: not yet accepted and not yet expired.
 *
 * The only question worth asking in most places — whether a sign-up may proceed,
 * whether to show it in the members list, whether a re-invite is redundant.
 */
export declare function isPendingInvitation(invitation: InvitationState, now?: Date): boolean;
/**
 * Lapsed without being used, so it is safe to clear and replace.
 *
 * Deliberately distinct from `!isPendingInvitation(...)`: an *accepted*
 * invitation is also "not pending", but deleting it would erase the record that
 * someone joined by invitation.
 */
export declare function isStaleInvitation(invitation: InvitationState, now?: Date): boolean;
//# sourceMappingURL=invitation-status.d.ts.map
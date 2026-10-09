export type AuthErrorCode = 'no_session' | 'session_expired' | 'no_organization' | 'pending_invitations' | 'kicked_from_org' | 'unauthorized';
export declare class AuthError extends Error {
    code: AuthErrorCode;
    constructor(code: AuthErrorCode, message: string);
}
export declare function createAuthError(code: AuthErrorCode, message: string): AuthError;
//# sourceMappingURL=auth-errors.d.ts.map
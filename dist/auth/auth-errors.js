// Custom authentication errors with error codes for better error handling
export class AuthError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'AuthError';
    }
}
// Helper function to create auth errors
export function createAuthError(code, message) {
    return new AuthError(code, message);
}

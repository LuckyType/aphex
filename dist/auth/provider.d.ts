import type { SessionAuth, PartialSessionAuth, ApiKeyAuth } from '../types/index.js';
import type { DatabaseAdapter } from '../db/interfaces/index.js';
export interface AuthProvider {
    getSession(request: Request, db: DatabaseAdapter): Promise<SessionAuth | PartialSessionAuth | null>;
    requireSession(request: Request, db: DatabaseAdapter): Promise<SessionAuth>;
    validateApiKey(request: Request, db: DatabaseAdapter): Promise<ApiKeyAuth | null>;
    requireApiKey(request: Request, db: DatabaseAdapter, permission?: 'read' | 'write'): Promise<ApiKeyAuth>;
    getUserById(userId: string): Promise<{
        id: string;
        name?: string;
        email: string;
        image?: string;
    } | null>;
    getUserByEmail(email: string): Promise<{
        id: string;
        name?: string;
        email: string;
        image?: string;
    } | null>;
    changeUserName(userId: string, name: string): Promise<void>;
    changeUserImage?(userId: string, image: string | null): Promise<void>;
    requestPasswordReset(email: string, redirectTo?: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<void>;
}
//# sourceMappingURL=provider.d.ts.map
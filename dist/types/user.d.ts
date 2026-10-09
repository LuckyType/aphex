export interface UserProfile {
    userId: string;
    role: 'super_admin' | 'admin' | 'editor' | 'viewer';
    preferences?: Record<string, any>;
}
export interface AuthUser {
    id: string;
    email: string;
    name?: string;
    image?: string;
}
export interface CMSUser extends AuthUser, Omit<UserProfile, 'userId'> {
}
//# sourceMappingURL=user.d.ts.map
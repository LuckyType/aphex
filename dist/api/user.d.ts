import type { CMSUser } from '../types/user.js';
import type { ApiResponse } from './types.js';
import type { UpdateUserRequest, UpdateUserPreferencesRequest } from './schemas/user.js';
export type UpdateProfileData = UpdateUserRequest;
export declare class UserApi {
    /**
     * Update user profile
     */
    static updateProfile(data: UpdateUserRequest): Promise<ApiResponse<CMSUser>>;
    /**
     * Update CMS preferences (e.g. includeChildOrganizations)
     */
    static updatePreferences(prefs: UpdateUserPreferencesRequest): Promise<ApiResponse<{
        success: boolean;
    }>>;
}
export declare const user: {
    updateProfile: typeof UserApi.updateProfile;
    updatePreferences: typeof UserApi.updatePreferences;
};
//# sourceMappingURL=user.d.ts.map
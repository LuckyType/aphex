// User API client - composable user operations
import { apiClient } from './client.js';
export class UserApi {
    /**
     * Update user profile
     */
    static async updateProfile(data) {
        return apiClient.patch('/user', data);
    }
    /**
     * Update CMS preferences (e.g. includeChildOrganizations)
     */
    static async updatePreferences(prefs) {
        return apiClient.patch('/user/cms-preference', prefs);
    }
}
export const user = {
    updateProfile: UserApi.updateProfile.bind(UserApi),
    updatePreferences: UserApi.updatePreferences.bind(UserApi)
};

// Instance Settings API client - composable instance operations
import { apiClient } from './client.js';
export class InstanceApi {
    /**
     * Get instance settings
     */
    static async getSettings() {
        return apiClient.get('/instance-settings');
    }
    /**
     * Update instance settings (super_admin only)
     */
    static async updateSettings(data) {
        return apiClient.patch('/instance-settings', data);
    }
}
// Export convenience functions for direct use
export const instance = {
    getSettings: InstanceApi.getSettings.bind(InstanceApi),
    updateSettings: InstanceApi.updateSettings.bind(InstanceApi)
};

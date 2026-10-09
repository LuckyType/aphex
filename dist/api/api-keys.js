// API Keys client - composable API key operations
import { apiClient } from './client.js';
export class ApiKeysApi {
    /**
     * Create a new API key
     */
    static async create(data) {
        return apiClient.post('/settings/api-keys', data);
    }
    /**
     * Delete an API key
     */
    static async remove(id) {
        return apiClient.delete(`/settings/api-keys/${id}`);
    }
}
export const apiKeys = {
    create: ApiKeysApi.create.bind(ApiKeysApi),
    remove: ApiKeysApi.remove.bind(ApiKeysApi)
};

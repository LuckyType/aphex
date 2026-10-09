// Roles API client — per-organization role CRUD.
import { apiClient } from './client.js';
export class RolesApi {
    /** List all roles (built-in + custom) for the active organization. */
    static async list() {
        return apiClient.get('/roles');
    }
    /** Create a custom role. Built-in names are rejected server-side. */
    static async create(data) {
        return apiClient.post('/roles', data);
    }
    /** Edit description or capabilities. Works on built-ins too. */
    static async update(name, data) {
        return apiClient.patch(`/roles/${encodeURIComponent(name)}`, data);
    }
    /** Delete a custom role. Built-ins and in-use roles are blocked server-side. */
    static async remove(name) {
        return apiClient.delete(`/roles/${encodeURIComponent(name)}`);
    }
}
export const roles = {
    list: RolesApi.list.bind(RolesApi),
    create: RolesApi.create.bind(RolesApi),
    update: RolesApi.update.bind(RolesApi),
    remove: RolesApi.remove.bind(RolesApi)
};

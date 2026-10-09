import type { ApiResponse } from './types.js';
import type { Role } from '../types/capabilities.js';
import type { CreateRoleRequest, UpdateRoleRequest } from './schemas/roles.js';
export declare class RolesApi {
    /** List all roles (built-in + custom) for the active organization. */
    static list(): Promise<ApiResponse<Role[]>>;
    /** Create a custom role. Built-in names are rejected server-side. */
    static create(data: CreateRoleRequest): Promise<ApiResponse<Role>>;
    /** Edit description or capabilities. Works on built-ins too. */
    static update(name: string, data: UpdateRoleRequest): Promise<ApiResponse<Role>>;
    /** Delete a custom role. Built-ins and in-use roles are blocked server-side. */
    static remove(name: string): Promise<ApiResponse<{
        success: boolean;
    }>>;
}
export declare const roles: {
    list: typeof RolesApi.list;
    create: typeof RolesApi.create;
    update: typeof RolesApi.update;
    remove: typeof RolesApi.remove;
};
//# sourceMappingURL=roles.d.ts.map
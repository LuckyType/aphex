import type { ApiResponse } from './types.js';
import type { ApiKeyPermission } from './schemas/api-keys.js';
import type { Capability } from '../types/capabilities.js';
export interface ApiKey {
    id: string;
    name: string | null;
    key?: string;
    /** Legacy coarse scopes; preserved for UI compatibility. */
    permissions: ApiKeyPermission[];
    /** Fine-grained capability allowlist (if this key was issued with one). */
    capabilities?: Capability[];
    createdAt: Date | null;
    lastRequest: Date | null;
    expiresAt: Date | null;
}
export interface CreateApiKeyData {
    name: string;
    permissions?: ApiKeyPermission[];
    capabilities?: Capability[];
    expiresInDays?: number;
}
export interface CreateApiKeyResponse {
    apiKey: ApiKey & {
        key: string;
    };
}
export declare class ApiKeysApi {
    /**
     * Create a new API key
     */
    static create(data: CreateApiKeyData): Promise<ApiResponse<CreateApiKeyResponse>>;
    /**
     * Delete an API key
     */
    static remove(id: string): Promise<ApiResponse<{
        success: boolean;
    }>>;
}
export declare const apiKeys: {
    create: typeof ApiKeysApi.create;
    remove: typeof ApiKeysApi.remove;
};
//# sourceMappingURL=api-keys.d.ts.map
import type { InstanceSettings } from '../types/instance.js';
import type { ApiResponse } from './types.js';
export declare class InstanceApi {
    /**
     * Get instance settings
     */
    static getSettings(): Promise<ApiResponse<InstanceSettings>>;
    /**
     * Update instance settings (super_admin only)
     */
    static updateSettings(data: Partial<InstanceSettings>): Promise<ApiResponse<InstanceSettings>>;
}
export declare const instance: {
    getSettings: typeof InstanceApi.getSettings;
    updateSettings: typeof InstanceApi.updateSettings;
};
//# sourceMappingURL=instance.d.ts.map
import { z } from 'zod';
export declare const savePluginSettingsRequest: z.ZodObject<{
    values: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, z.core.$strip>;
export type SavePluginSettingsRequest = z.infer<typeof savePluginSettingsRequest>;
//# sourceMappingURL=plugin-settings.d.ts.map
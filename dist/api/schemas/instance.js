import { z } from 'zod';
// ---------- PATCH /instance-settings ----------
export const updateInstanceSettingsRequest = z
    .object({
    allowUserOrgCreation: z.boolean().optional()
})
    .strict();

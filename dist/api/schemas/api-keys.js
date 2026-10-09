import { z } from 'zod';
import { normalizeCapabilities } from '../../types/capabilities.js';
import { capabilitySchema } from './roles.js';
// ---------- Shared ----------
export const apiKeyPermissionSchema = z.enum(['read', 'write']);
// Same capability-id format guard as roles; the authoritative validity check
// (against the runtime registry) happens in the route handler.
export const apiKeyCapabilitySchema = capabilitySchema;
// ---------- POST /settings/api-keys ----------
// Two provisioning modes:
//   1. Coarse `permissions`: 'read' alone, or 'write' (always implies read).
//   2. Fine-grained `capabilities`: explicit allowlist; writes auto-include
//      the matching read cap during normalization.
// Exactly one of the two should be supplied (neither is invalid).
export const createApiKeyRequest = z
    .object({
    name: z.string().min(1),
    permissions: z.array(apiKeyPermissionSchema).optional(),
    capabilities: z.array(apiKeyCapabilitySchema).optional(),
    expiresInDays: z.number().int().positive().optional()
})
    .refine((v) => (v.permissions && v.permissions.length > 0) || (v.capabilities && v.capabilities.length > 0), { message: 'Provide at least one of `permissions` or `capabilities`.' })
    .transform((v) => ({
    ...v,
    permissions: v.permissions
        ? v.permissions.includes('write')
            ? ['read', 'write']
            : ['read']
        : undefined,
    capabilities: v.capabilities ? normalizeCapabilities(v.capabilities) : undefined
}));

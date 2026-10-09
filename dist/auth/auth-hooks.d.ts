import type { RequestEvent } from '@sveltejs/kit';
import type { DatabaseAdapter } from '../db/index.js';
import type { CMSConfig } from '../types/index.js';
import type { RolesService } from '../services/roles-service.js';
import type { AuthProvider } from './provider.js';
export declare function handleAuthHook(event: RequestEvent, config: CMSConfig, authProvider: AuthProvider, db: DatabaseAdapter, rolesService: RolesService): Promise<Response | null>;
//# sourceMappingURL=auth-hooks.d.ts.map
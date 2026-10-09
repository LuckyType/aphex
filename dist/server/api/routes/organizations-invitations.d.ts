import { Hono } from 'hono';
import type { AphexEnv } from '../index.js';
/**
 * Note: in studio, invitations are wrapped by a SvelteKit `+server.ts`
 * that adds email sending after the invite row is created. While that
 * shim exists, this Hono router sits dormant (specific SK routes win
 * over the catch-all). Phase 5 moves the wrapper into `config.api`.
 */
export declare const organizationsInvitationsRouter: Hono<AphexEnv>;
//# sourceMappingURL=organizations-invitations.d.ts.map
import { Hono } from 'hono';
import type { AphexEnv } from '../index.js';
import type { CMSInstances } from '../../../hooks.js';
import type { LocalAPIContext } from '../../../local-api/index.js';
/**
 * Best-effort audit record for one mutating tool call — looks up the two most recent
 * document-version rows to capture `versionBefore`/`versionAfter` (the version an undo would
 * restore to, and the one this write produced), then records the operation. Never throws: a
 * failure to record the audit trail must never break the actual tool call or the SSE stream.
 * Exported for unit testing — not part of the route's own public surface.
 */
export declare function recordMutatingOperation(aphexCMS: CMSInstances, context: LocalAPIContext, changeSetId: string, toolName: string, args: Record<string, unknown>, success: boolean, error: string | undefined, data: unknown): Promise<void>;
export declare const agentChatRouter: Hono<AphexEnv>;
//# sourceMappingURL=agent-chat.d.ts.map
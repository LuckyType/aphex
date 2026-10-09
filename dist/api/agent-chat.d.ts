import type { ApiResponse } from './types.js';
import type { AgentChatRequest } from './schemas/agent-chat.js';
import type { RecordWorkspaceOperationRequest } from './schemas/agent-operations.js';
import type { AgentStreamEvent } from '../types/agent-stream.js';
/**
 * Streams one leg of an agent turn. Not built on `apiClient` — that always `await`s and parses
 * a JSON body, which is structurally incompatible with a chunked SSE response; this is the one
 * agent-chat call that needs the raw `fetch` + `ReadableStream`. `signal` is caller-supplied
 * (not `apiClient`'s own internal 10s timeout) so the chat panel's Stop button can abort
 * mid-stream regardless of how long a turn runs.
 *
 * A turn that pauses for a workspace tool (`finishReason: 'awaiting_workspace_tool'`) ends this
 * generator normally — resolving the pause and resuming is the caller's job (`AgentChat.svelte`
 * re-calls this with the same `changeSetId` echoed back), not something this function loops on
 * itself.
 */
export declare function streamAgentChat(body: AgentChatRequest, signal?: AbortSignal): AsyncGenerator<AgentStreamEvent>;
/**
 * Records an audit row for a workspace-bridge tool (`content_patch_fields`/`content_save_draft`)
 * the client resolved locally against a live `DocumentWorkspace` — see
 * `server/api/routes/agent-chat.ts`'s `POST /operations`. Plain JSON request/response, so unlike
 * `streamAgentChat` above, this one goes through the shared `apiClient`.
 */
export declare function recordWorkspaceOperation(body: RecordWorkspaceOperationRequest): Promise<ApiResponse<{
    success: true;
}>>;
//# sourceMappingURL=agent-chat.d.ts.map
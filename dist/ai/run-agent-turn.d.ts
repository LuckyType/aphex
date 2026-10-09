import type { AIProviderAdapter, AIMessage } from './interfaces/ai-provider.js';
import type { AgentStreamEvent } from '../types/agent-stream.js';
import type { ContentAgentTool } from '../mcp/tools.js';
import type { AgentToolExecutionContext } from '../types/agent-tools.js';
export interface RunAgentTurnOptions {
    aiProvider: AIProviderAdapter;
    model: string;
    messages: AIMessage[];
    /** The caller's resolved tool list — see `resolveAgentTools` in `mcp/tools.ts`. */
    tools: ContentAgentTool[];
    toolContext: AgentToolExecutionContext;
    /** Prepended ahead of `messages` on every model call within this turn, but never spliced
     * into `messages` itself — it must stay out of the `done` event's `messages` (what the
     * client persists and replays next turn), or a stale copy would get resent forever and an
     * app-level prompt change would never reach an already-open conversation. */
    systemPrompt?: string;
    maxTokens?: number;
    /** Safety cap on tool-calling round trips before the turn is force-stopped as an error. */
    maxToolRoundtrips?: number;
    /** Maximum failed executions of one tool in this turn, including the initial attempt. */
    maxToolFailureAttempts?: number;
    signal?: AbortSignal;
}
/**
 * Streams one agent turn: sends `messages` to the model, executes any tool calls it
 * requests against `tools`, feeds the results back as `tool` messages, and repeats until
 * the model stops calling tools (or `maxToolRoundtrips` is hit — surfaced as an error
 * rather than looping forever against a model that won't stop calling tools).
 */
export declare function runAgentTurn(opts: RunAgentTurnOptions): AsyncIterable<AgentStreamEvent>;
//# sourceMappingURL=run-agent-turn.d.ts.map
/** One message in a conversation. `tool` messages carry the result of a prior `toolCallId`. */
export interface AIMessage {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    /** Present on an assistant message that requested one or more tool calls. */
    toolCalls?: AIToolCall[];
    /** Present on a `tool` role message — which prior call this is the result of. */
    toolCallId?: string;
}
/** A single tool invocation the model requested. */
export interface AIToolCall {
    id: string;
    name: string;
    /** Parsed JSON arguments the model produced — already validated against the tool's zod schema by the caller before execution. */
    arguments: Record<string, unknown>;
}
/**
 * A tool definition adapted to the provider's function-calling format. The
 * adapter owns converting `AgentToolDefinition.inputSchema` (zod) into this
 * shape — cms-core stays schema-library-agnostic on the wire, only zod
 * internally.
 */
export interface AIToolSpec {
    name: string;
    description: string;
    /** JSON Schema describing the arguments object. */
    parameters: Record<string, unknown>;
}
export interface AIChatRequest {
    /** Provider-specific model identifier, e.g. `anthropic/claude-sonnet-4.5` (OpenRouter) or `claude-sonnet-4-5` (Anthropic direct). */
    model: string;
    messages: AIMessage[];
    tools?: AIToolSpec[];
    /** Optional cap; adapters should pass their provider's equivalent through unchanged when omitted. */
    maxTokens?: number;
    /** Aborts the in-flight request — cancellation propagates from the browser tab through the runtime to here. */
    signal?: AbortSignal;
}
/**
 * One item in a streamed response. The runtime layer (apps/studio, not
 * cms-core) maps this onto whatever wire format it sends the browser
 * (SSE/NDJSON) — this is the provider-boundary shape, not the browser-facing
 * one, though the two are intentionally close.
 */
export type AIStreamEvent = {
    type: 'text';
    delta: string;
} | {
    type: 'toolCall';
    toolCall: AIToolCall;
} | {
    type: 'usage';
    promptTokens: number;
    completionTokens: number;
} | {
    type: 'error';
    message: string;
} | {
    type: 'done';
    finishReason: 'stop' | 'tool_calls' | 'length' | 'error';
};
export interface AIProviderAdapter {
    readonly name: string;
    /** Stream a chat completion, yielding events as the model produces them. */
    chatStream(request: AIChatRequest): AsyncIterable<AIStreamEvent>;
}
//# sourceMappingURL=ai-provider.d.ts.map
export type HistoryMessage = {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    toolCalls?: Array<{
        id: string;
        name: string;
        arguments: Record<string, unknown>;
    }>;
    toolCallId?: string;
};
export type ToolCall = {
    id: string;
    name: string;
    arguments: Record<string, unknown>;
    status: 'running' | 'complete' | 'error';
    result?: unknown;
    error?: string;
};
export type Turn = {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    status: 'complete' | 'streaming' | 'error' | 'stopped';
    toolCalls: ToolCall[];
    error?: string;
    /** Only set on user turns — `history.length` right before this turn was sent, so
     * `retry()` can roll `history` back to exactly that point rather than guessing an
     * offset (a turn's server-reported `messages` can add more than 2 entries once tool
     * calls are involved). */
    historyIndexBeforeTurn?: number;
};
export declare const agentChatState: {
    turns: Turn[];
    history: HistoryMessage[];
    contextSentFor: string | null;
    lastPromptTokens: number;
};
//# sourceMappingURL=agent-chat-state.svelte.d.ts.map
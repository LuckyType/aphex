export type WorkspaceToolResult = {
    success: boolean;
    data?: unknown;
    error?: string;
};
export type WorkspaceToolMessage = {
    role: 'system' | 'tool';
    content: string;
    toolCallId?: string;
};
export declare function workspaceToolFailureNotice(name: string, error?: string): string;
/** Build the exact messages used to resume the model after a browser-side workspace call. */
export declare function workspaceToolResultMessages(toolCallId: string, name: string, result: WorkspaceToolResult): WorkspaceToolMessage[];
//# sourceMappingURL=workspace-tool-messages.d.ts.map
export function workspaceToolFailureNotice(name, error) {
    return `WORKSPACE TOOL FAILURE: ${name} failed. The editor may contain in-memory changes, but they were not saved. Do not claim the content was created, updated, or saved. Tell the user it remains unsaved and explain this error: ${error ?? 'Unknown error'}`;
}
/** Build the exact messages used to resume the model after a browser-side workspace call. */
export function workspaceToolResultMessages(toolCallId, name, result) {
    const messages = [
        {
            role: 'tool',
            toolCallId,
            content: JSON.stringify({
                success: result.success,
                persisted: name === 'content_save_draft' ? result.success : false,
                data: result.data ?? null,
                ...(result.error ? { error: result.error } : {})
            })
        }
    ];
    if (!result.success) {
        messages.push({ role: 'system', content: workspaceToolFailureNotice(name, result.error) });
    }
    return messages;
}

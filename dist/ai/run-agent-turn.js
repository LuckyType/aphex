// ai/run-agent-turn.ts
//
// The tool-calling loop that drives one agent turn to completion — the "runtime" half of sitting on top of the
// `AIProviderAdapter` port and the `ContentAgentTool` list `resolveAgentTools` (mcp/tools.ts)
// already resolves for MCP. Transport-agnostic: this function has no knowledge of HTTP/SSE —
// a route handler consumes the `AgentStreamEvent`s it yields and maps them onto the wire.
import { z } from 'zod';
import { hasCapability } from '../types/capabilities.js';
const DEFAULT_MAX_TOOL_ROUNDTRIPS = 8;
const DEFAULT_MAX_TOOL_FAILURE_ATTEMPTS = 3;
const SCHEMA_REQUIRED_TOOLS = new Set(['validate_document', 'create_document', 'update_document']);
function schemasLoadedIn(messages) {
    const schemaCalls = new Map();
    const loaded = new Set();
    for (const message of messages) {
        if (message.role === 'assistant') {
            for (const call of message.toolCalls ?? []) {
                const collection = call.arguments.collection;
                if (call.name === 'get_schema' && typeof collection === 'string') {
                    schemaCalls.set(call.id, collection);
                }
            }
        }
        else if (message.role === 'tool' && message.toolCallId) {
            const collection = schemaCalls.get(message.toolCallId);
            if (!collection)
                continue;
            try {
                const result = JSON.parse(message.content);
                if (result && result.success !== false && !result.error)
                    loaded.add(collection);
            }
            catch {
                // A malformed historical result cannot prove that schema discovery succeeded.
            }
        }
    }
    return loaded;
}
function requiredSchemaCollection(call) {
    const collection = call.arguments.collection;
    if (typeof collection !== 'string')
        return null;
    if (SCHEMA_REQUIRED_TOOLS.has(call.name))
        return collection;
    if (call.name === 'query_documents' && ('where' in call.arguments || 'sort' in call.arguments)) {
        return collection;
    }
    return null;
}
function toToolSpec(tool) {
    return {
        name: tool.definition.name,
        description: tool.definition.description,
        parameters: z.toJSONSchema(tool.definition.inputSchema)
    };
}
/**
 * Streams one agent turn: sends `messages` to the model, executes any tool calls it
 * requests against `tools`, feeds the results back as `tool` messages, and repeats until
 * the model stops calling tools (or `maxToolRoundtrips` is hit — surfaced as an error
 * rather than looping forever against a model that won't stop calling tools).
 */
export async function* runAgentTurn(opts) {
    const messages = [...opts.messages];
    const systemMessage = opts.systemPrompt
        ? { role: 'system', content: opts.systemPrompt }
        : null;
    const toolsByName = new Map(opts.tools.map((t) => [t.definition.name, t]));
    const toolSpecs = opts.tools.map(toToolSpec);
    const maxRoundtrips = opts.maxToolRoundtrips ?? DEFAULT_MAX_TOOL_ROUNDTRIPS;
    const maxFailureAttempts = Math.max(1, opts.maxToolFailureAttempts ?? DEFAULT_MAX_TOOL_FAILURE_ATTEMPTS);
    const failureAttemptsByTool = new Map();
    const loadedSchemas = schemasLoadedIn(messages);
    let roundtrips = 0;
    for (;;) {
        let assistantText = '';
        const pendingToolCalls = [];
        let finishReason = 'stop';
        let erroredOut = false;
        for await (const event of opts.aiProvider.chatStream({
            model: opts.model,
            messages: systemMessage ? [systemMessage, ...messages] : messages,
            tools: toolSpecs,
            maxTokens: opts.maxTokens,
            signal: opts.signal
        })) {
            switch (event.type) {
                case 'text':
                    assistantText += event.delta;
                    yield event;
                    break;
                case 'toolCall':
                    pendingToolCalls.push(event.toolCall);
                    yield {
                        type: 'toolCall',
                        toolCallId: event.toolCall.id,
                        name: event.toolCall.name,
                        arguments: event.toolCall.arguments
                    };
                    break;
                case 'usage':
                    yield event;
                    break;
                case 'error':
                    yield event;
                    erroredOut = true;
                    break;
                case 'done':
                    finishReason = event.finishReason;
                    break;
            }
        }
        if (erroredOut) {
            if (assistantText)
                messages.push({ role: 'assistant', content: assistantText });
            yield { type: 'done', finishReason: 'error', messages };
            return;
        }
        if (finishReason !== 'tool_calls' || pendingToolCalls.length === 0) {
            // Unlike the tool-calling branch below, nothing else pushes this round's assistant
            // reply onto `messages` — this is the terminal round, so it must happen here or the
            // model's final answer would be silently missing from the conversation `messages`
            // hands back for the next turn to replay.
            if (assistantText)
                messages.push({ role: 'assistant', content: assistantText });
            yield { type: 'done', finishReason, messages };
            return;
        }
        if (++roundtrips > maxRoundtrips) {
            yield { type: 'error', message: `Stopped after ${maxRoundtrips} tool-calling round trips.` };
            yield { type: 'done', finishReason: 'error', messages };
            return;
        }
        messages.push({ role: 'assistant', content: assistantText, toolCalls: pendingToolCalls });
        // `execution: 'workspace'` tools touch a live, possibly-unsaved editor draft that only
        // exists in the browser — this server-side loop can't run them. Every other call in the
        // round still executes normally below; the workspace calls are set aside and, once the
        // round finishes, pause the turn instead of looping — the caller resolves them locally
        // and resumes with a fresh request (see `types/agent-stream.ts`'s `done` event doc).
        const workspaceCalls = [];
        const executableCalls = [];
        for (const call of pendingToolCalls) {
            const tool = toolsByName.get(call.name);
            (tool?.definition.execution === 'workspace' ? workspaceCalls : executableCalls).push(call);
        }
        for (const call of executableCalls) {
            const tool = toolsByName.get(call.name);
            let success;
            let data;
            let error;
            let retryable = true;
            const priorFailures = failureAttemptsByTool.get(call.name) ?? 0;
            const requiredSchema = requiredSchemaCollection(call);
            if (priorFailures >= maxFailureAttempts) {
                success = false;
                retryable = false;
                error = `Retry limit reached for ${call.name} after ${maxFailureAttempts} failed executions.`;
            }
            else if (requiredSchema && !loadedSchemas.has(requiredSchema)) {
                success = false;
                error = `Schema required: call get_schema for collection "${requiredSchema}" before ${call.name}, then retry using only fields and shapes it returns.`;
            }
            else if (!tool) {
                success = false;
                retryable = false;
                error = `Unknown tool: ${call.name}`;
            }
            else {
                // Defense in depth: `tools` is expected to already be filtered to this caller's
                // capabilities (see `resolveAgentTools`), but a tool must reject direct invocation
                // too — never rely on the advertisement filter alone (AgentToolDefinition's own
                // doc comment on `requiredCapabilities` is explicit about this).
                const requiredCaps = tool.definition.requiredCapabilities ?? [];
                const auth = opts.toolContext.context.auth;
                const authorized = requiredCaps.length === 0 ||
                    (auth != null && requiredCaps.every((c) => hasCapability(auth, c)));
                if (!authorized) {
                    success = false;
                    retryable = false;
                    error = `Forbidden: requires ${requiredCaps.join(', ')}`;
                }
                else {
                    const parsed = tool.definition.inputSchema.safeParse(call.arguments);
                    if (!parsed.success) {
                        success = false;
                        error = `Invalid arguments: ${parsed.error.message}`;
                    }
                    else {
                        try {
                            const result = await tool.execute(parsed.data, opts.toolContext);
                            success = result.success;
                            data = result.success ? result.data : undefined;
                            error = result.success ? undefined : result.error;
                        }
                        catch (err) {
                            success = false;
                            error = err instanceof Error ? err.message : String(err);
                        }
                    }
                }
            }
            yield { type: 'toolResult', toolCallId: call.id, name: call.name, success, data, error };
            if (success) {
                failureAttemptsByTool.delete(call.name);
                if (call.name === 'get_schema') {
                    const collection = call.arguments.collection;
                    if (typeof collection === 'string')
                        loadedSchemas.add(collection);
                }
            }
            const failureAttempt = success
                ? 0
                : retryable
                    ? Math.min(priorFailures + 1, maxFailureAttempts)
                    : maxFailureAttempts;
            if (!success)
                failureAttemptsByTool.set(call.name, failureAttempt);
            const retryAllowed = !success && retryable && failureAttempt < maxFailureAttempts;
            messages.push({
                role: 'tool',
                toolCallId: call.id,
                content: JSON.stringify(success
                    ? (data ?? null)
                    : {
                        success: false,
                        error,
                        attempt: failureAttempt,
                        maxAttempts: maxFailureAttempts,
                        retryAllowed
                    })
            });
            if (!success) {
                messages.push({
                    role: 'system',
                    content: retryAllowed
                        ? `TOOL FAILURE ${failureAttempt}/${maxFailureAttempts} for ${call.name}: ${error} Use this exact error to correct the arguments or plan before retrying. Do not repeat the same call unchanged.`
                        : `TOOL FAILURE for ${call.name}: ${error} Do not call this tool again in this turn. Explain the blocker accurately and do not claim success.`
                });
            }
        }
        if (workspaceCalls.length > 0) {
            yield {
                type: 'done',
                finishReason: 'awaiting_workspace_tool',
                messages,
                pendingWorkspaceCalls: workspaceCalls.map((c) => ({
                    toolCallId: c.id,
                    name: c.name,
                    arguments: c.arguments
                }))
            };
            return;
        }
    }
}

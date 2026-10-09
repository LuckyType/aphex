import { z } from 'zod';
import type { CMSInstances } from '../hooks.js';
import type { LocalAPIContext } from '../local-api/index.js';
import type { AgentToolDefinition, AgentToolExecutor } from '../types/agent-tools.js';
export interface McpToolResult {
    content: Array<{
        type: 'text';
        text: string;
    }>;
    isError?: boolean;
}
export interface McpTool {
    name: string;
    description: string;
    /** zod raw shape describing the tool's arguments. */
    inputSchema: z.ZodRawShape;
    handler: (args: Record<string, unknown>) => Promise<McpToolResult>;
}
export interface McpToolDeps {
    aphexCMS: CMSInstances;
    context: LocalAPIContext;
}
/** One content tool: its serializable definition plus the function that runs it. */
export interface ContentAgentTool {
    definition: AgentToolDefinition<any>;
    execute: AgentToolExecutor<any>;
}
/**
 * The content-plane tools, safe to expose against a live instance: all writes go through
 * LocalAPI, so a read-only API key is rejected by the permission layer, not by this
 * registry. `requiredCapabilities` here is the advertisement/execution gate for the new
 * agent-tool contract; document tools additionally get real enforcement downstream from
 * `CollectionAPI`'s own `PermissionChecker` (unchanged) — `asset.read`/`asset.upload` have no
 * such downstream check, so `list_assets`/`upload_asset` enforce it directly in `execute`.
 */
export declare const contentAgentTools: ContentAgentTool[];
export interface ResolveAgentToolsOptions {
    /** Set when the caller has a live document editor tab to bridge into — see
     * `document-workspace-registry.svelte.ts` and `types/document-workspace.ts`. Only when
     * this is present are the `execution: 'workspace'` tools (`content-workspace-tools.ts`)
     * advertised at all; MCP and any request with no matching open document never see them,
     * since there's no live draft on the other end to round-trip into. */
    documentContext?: {
        collection: string;
        id: string;
    };
}
/**
 * The full set of tools this caller can see: core built-ins plus any
 * plugin-contributed `aphex/agent/tool` parts their capabilities unlock
 * (`partResolver.agentToolsForCapabilities`), plus the workspace-bridge tools when
 * `documentContext` is given — the one shared list MCP, the in-admin agent runtime
 * (`ai/run-agent-turn.ts`), and any other future tool-calling transport all resolve from.
 * Core built-ins always win a name collision, since they're the platform's own contract.
 */
export declare function resolveAgentTools({ aphexCMS, context }: McpToolDeps, opts?: ResolveAgentToolsOptions): ContentAgentTool[];
/**
 * Adapt `resolveAgentTools` into the MCP SDK's expected shape for one authenticated
 * request. All the actual tool logic lives in `contentAgentTools`/plugin parts above —
 * this is purely a transport-shape + result-shape conversion.
 */
export declare function buildContentTools(deps: McpToolDeps): McpTool[];
//# sourceMappingURL=tools.d.ts.map
import type { DocumentWorkspace } from '../types/document-workspace.js';
import type { WorkspaceToolResult } from './workspace-tool-messages.js';
/** Validate candidate document data before exposing a patch in the live editor. */
export declare function applyWorkspacePatch(fields: Record<string, unknown>, workspace: DocumentWorkspace): Promise<WorkspaceToolResult>;
//# sourceMappingURL=apply-workspace-patch.d.ts.map
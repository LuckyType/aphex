import type { DocumentWorkspace } from './types/document-workspace.js';
export interface RegisteredDocumentWorkspace {
    documentId: string;
    collection: string;
    workspace: DocumentWorkspace;
}
export declare const documentWorkspaceRegistry: {
    readonly current: RegisteredDocumentWorkspace | null;
    register(entry: RegisteredDocumentWorkspace): void;
    /** Id-checked: an editor that already unmounted (and cleared with its own id) can't
     * clobber a newer registration from a different document that mounted in its place
     * during fast navigation. */
    clear(documentId: string): void;
};
//# sourceMappingURL=document-workspace-registry.svelte.d.ts.map
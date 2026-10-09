import type { SchemaType } from '../../types/schemas.js';
import type { CMSPlugin } from '../../plugins/types.js';
interface Props {
    schemas: SchemaType[];
    documentType: string;
    documentId?: string | null;
    isCreating: boolean;
    onBack: () => void;
    /** When set, the close control renders as a labelled "← {backLabel}" button
     *  instead of a bare close (x) icon — used for reference editors so the action
     *  reads as "go back" rather than "close". */
    backLabel?: string;
    onSaved?: (documentId: string) => void;
    onAutoSaved?: (documentId: string, title: string) => void;
    onDeleted?: () => void;
    onPublished?: (documentId: string) => void;
    onUnpublished?: (documentId: string) => void;
    onRestored?: (documentId: string) => void;
    onOpenReference?: (documentId: string, documentType: string) => void;
    onOpenVersionHistory?: (documentId: string) => void;
    externalVersionPreview?: {
        versionNumber: number;
        data: Record<string, any>;
        eventType: string;
        createdAt?: string;
    } | null;
    isReadOnly?: boolean;
    /** Suppresses the bottom action bar (Publish / Schedule / Unpublish / Delete).
     *  Set by the host when another editor is stacked on top of this one and owns
     *  the actions instead — two action bars in the same corner give no clue which
     *  document each one publishes. This hides the bar only; the document keeps
     *  auto-saving and its status stays visible in the header. */
    hideActionBar?: boolean;
    /** When true, the host has hidden side panels — show a Minimize toggle. */
    focusMode?: boolean;
    /** Toggle host-driven focus mode. Omit to hide the focus button entirely. */
    onToggleFocus?: () => void;
    /** When true, split the editor with a live preview iframe on the right. */
    presentationMode?: boolean;
    /**
     * Bump this to ask the preview iframe to re-fetch its server-loaded data
     * (`aphex:refresh` → `invalidateAll` in the overlay). Used when a *different*
     * document — e.g. one this page renders in a list — was edited elsewhere.
     */
    refreshToken?: number;
    /** Toggle host-driven presentation mode. Omit to hide the button entirely. */
    onTogglePresentation?: () => void;
    /** Organization ID from the host context — used as fallback for new docs that haven't been saved yet. */
    organizationId?: string | null;
    /** Build-time plugins; their document-action parts render in the toolbar. */
    plugins?: CMSPlugin[];
}
declare const DocumentEditor: import("svelte").Component<Props, {}, "">;
type DocumentEditor = ReturnType<typeof DocumentEditor>;
export default DocumentEditor;
//# sourceMappingURL=DocumentEditor.svelte.d.ts.map
interface Props {
    documentId: string;
    onClose: () => void;
    onRestored?: () => void;
    onPreviewVersion?: (version: {
        versionNumber: number;
        data: Record<string, any>;
        eventType: string;
        createdAt?: string;
    } | null) => void;
}
declare const DocumentVersionPanel: import("svelte").Component<Props, {
    refresh: () => Promise<void>;
}, "">;
type DocumentVersionPanel = ReturnType<typeof DocumentVersionPanel>;
export default DocumentVersionPanel;
//# sourceMappingURL=DocumentVersionPanel.svelte.d.ts.map
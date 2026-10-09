export interface AphexPreviewOptions {
    /**
     * Whether to scan DOM text nodes for stega markers and auto-stamp data-aphex-field.
     * Set to false if you add data-aphex-field attributes manually. Default: true.
     */
    stega?: boolean;
    /** Called whenever the CMS pushes a new document snapshot via postMessage. */
    onData?: (doc: Record<string, unknown>, meta?: {
        documentType?: string;
        documentId?: string;
    }) => void;
    /**
     * Called when the CMS asks the preview to re-fetch (`aphex:refresh`) — e.g. after a
     * *different* document was edited, whose data this page loaded server-side and can't
     * receive via `onData`. Wire it to SvelteKit's `invalidateAll()` for a smooth reload;
     * if omitted, the overlay falls back to a full `location.reload()`.
     */
    onRefresh?: () => void;
}
export declare function enableAphexPreview(options?: AphexPreviewOptions): () => void;
//# sourceMappingURL=core.d.ts.map
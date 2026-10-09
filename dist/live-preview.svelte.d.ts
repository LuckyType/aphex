export declare class LivePreviewContext {
    current: Record<string, unknown> | null;
    currentType: string | null;
    currentId: string | null;
}
export declare function setLivePreviewContext(): LivePreviewContext;
/**
 * Returns the live preview document context set by <AphexVisualOverlay>.
 * `preview.current` is null until the CMS pushes data via postMessage.
 * Use as: `const post = $derived(preview.current ?? data.post)`
 */
export declare function getLivePreviewDocument(): LivePreviewContext;
//# sourceMappingURL=live-preview.svelte.d.ts.map
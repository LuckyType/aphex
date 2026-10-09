import type { Snippet } from 'svelte';
interface Props {
    /**
     * Whether to use stega encoding for auto-detecting fields.
     * Must match the setting in DocumentEditor / aphex.config.ts. Default: true.
     */
    stega?: boolean;
    children?: Snippet;
}
declare const AphexVisualOverlay: import("svelte").Component<Props, {}, "">;
type AphexVisualOverlay = ReturnType<typeof AphexVisualOverlay>;
export default AphexVisualOverlay;
//# sourceMappingURL=AphexVisualOverlay.svelte.d.ts.map
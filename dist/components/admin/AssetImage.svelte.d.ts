import type { Snippet } from 'svelte';
interface Props {
    src: string | null | undefined;
    alt?: string;
    /** Applied to the `<img>` and to the placeholder, so layout holds either way. */
    class?: string;
    style?: string;
    loading?: 'lazy' | 'eager';
    /** The asset's stored MIME type, used to skip a load that cannot succeed. */
    mimeType?: string | null;
    /** Caption under the placeholder icon. Omit in tiles too small to read it. */
    label?: string;
    /**
     * Rendered instead of the `ImageOff` placeholder when there is nothing to
     * show. For an avatar or a logo the meaningful empty state is the initials
     * block the surrounding component already draws when no image is set —
     * falling back to it keeps a *failed* load looking like an *absent* one,
     * rather than introducing a second, unrelated empty state.
     */
    fallback?: Snippet;
}
declare const AssetImage: import("svelte").Component<Props, {}, "">;
type AssetImage = ReturnType<typeof AssetImage>;
export default AssetImage;
//# sourceMappingURL=AssetImage.svelte.d.ts.map
import { type StegaPayload } from './stega.js';
/**
 * Declare which document field a Portable Text body belongs to (e.g. `'content'`), so inline
 * blocks rendered by your Portable Text library can encode click-to-edit markers without
 * defining their own context plumbing. Call it in the component that renders the body.
 * Accepts a value or a getter (use a getter to stay reactive to a prop).
 */
export declare function setPortableTextField(field: string | (() => string)): void;
/** A payload like {@link StegaPayload} but with `field` optional — it falls back to the
 * Portable Text field context, so inline blocks can omit it. */
export type EncodePayload = Partial<StegaPayload>;
type ImageLike = {
    alt?: string;
    asset?: {
        _ref?: string;
        url?: string;
        alt?: string;
    };
} | null | undefined;
/** An image field resolved for rendering. */
export interface ResolvedImage {
    /** Public URL, or `null` if the image/asset is unset. */
    src: string | null;
    /** Effective alt text: per-placement override → asset default → `''`. */
    alt: string;
}
export interface PreviewApi {
    /** True while the visual editor is driving this page (a live document has been received). */
    readonly inPreview: boolean;
    /** The live document pushed by the editor, or `null` outside preview. */
    readonly document: Record<string, unknown> | null;
    /**
     * Schema type of the document currently open in the editor, or `null` outside preview.
     * Use it when one page is reachable from several document types and an element should
     * behave differently depending on which one is being edited — e.g. a menu row that
     * reveals its slot in the open menu's list, but opens the dish when a dish is open.
     */
    readonly documentType: string | null;
    /**
     * The live document merged over your server fallback:
     * `const post = $derived(ve.live(data.post))`.
     *
     * The editor's values win. Underscore-prefixed keys the editor doesn't carry —
     * data your `load` derived, like an archive block's resolved posts — are kept
     * from the fallback, so server-enriched content doesn't vanish in preview.
     */
    live<T>(fallback: T, options?: {
        type?: string;
        id?: string;
    }): T;
    /**
     * Make a value click-to-edit. In preview it returns the value stega-encoded with the
     * navigation payload; outside preview it returns the value unchanged. `field` defaults to
     * the Portable Text field context when omitted (for inline blocks).
     */
    encode(value: string | null | undefined, payload?: EncodePayload): string;
    /**
     * Make any element click-to-edit, for content the current document's own stega can't
     * mark up. Spread the returned attributes onto the element; returns `{}` outside preview.
     *
     * Two targets, chosen by whether `id`/`type` are given:
     * - **Another document** (`{ id, type }`) — an app-level reference not stored in the
     *   document being edited (e.g. an app-queried "list of posts" block). Clicking opens
     *   that document in the studio.
     * - **A field of the open document** (`{ field, arrayIndex }`) — clicking reveals that
     *   field, and with `arrayIndex` the specific row, in the form pane. Use this for a
     *   list whose entries are references: revealing the row is what lets the author
     *   reorder or remove it, which opening the referenced document does not.
     *
     * @example
     * // {...ve.edit({ id: post.id, type: 'blog_post' })}          → opens that post
     * // {...ve.edit({ field: 'items', arrayIndex: i })}           → reveals row i of `items`
     */
    edit(target: {
        id?: string;
        type?: string;
        field?: string;
        arrayIndex?: number;
    }): Record<string, string>;
    /**
     * Resolve an image field to `{ src, alt }` in one call — destructure it:
     * `const { src, alt } = $derived(ve.image(post.coverImage))`. Reads `asset.url`/`asset.alt`,
     * which the server injects at load time and the editor injects into the live document, so
     * the same call works for SSR and for newly-added/swapped images in preview.
     */
    image(img: ImageLike): ResolvedImage;
}
/**
 * One-call visual-editing helper for a page or component. Reads the context set by
 * `<AphexVisualOverlay>` (and any Portable Text field context). Call once during init.
 *
 * @example
 * const ve = usePreview();
 * const post = $derived(ve.live(data.post));
 * const cover = $derived(ve.image(post.coverImage));
 * // <time datetime={ve.encode(post.postDate, { field: 'postDate' })}>
 * // <img src={cover.src} alt={ve.encode(cover.alt, { field: 'coverImage' })} />
 */
export declare function usePreview(): PreviewApi;
export {};
//# sourceMappingURL=use-preview.svelte.d.ts.map
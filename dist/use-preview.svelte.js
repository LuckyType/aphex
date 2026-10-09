import { getContext, setContext } from 'svelte';
import { getLivePreviewDocument } from './live-preview.svelte.js';
import { stegaEncode } from './stega.js';
import { mergeDerived } from './merge-derived.js';
const PT_FIELD_KEY = Symbol('aphex:pt-field');
/**
 * Declare which document field a Portable Text body belongs to (e.g. `'content'`), so inline
 * blocks rendered by your Portable Text library can encode click-to-edit markers without
 * defining their own context plumbing. Call it in the component that renders the body.
 * Accepts a value or a getter (use a getter to stay reactive to a prop).
 */
export function setPortableTextField(field) {
    setContext(PT_FIELD_KEY, typeof field === 'function' ? field : () => field);
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
export function usePreview() {
    const ctx = getLivePreviewDocument();
    const ptField = getContext(PT_FIELD_KEY);
    return {
        get inPreview() {
            return ctx.current != null;
        },
        get document() {
            return ctx.current;
        },
        get documentType() {
            return ctx.currentType;
        },
        live(fallback, options = {}) {
            if (options.type && ctx.currentType !== options.type)
                return fallback;
            if (options.id && ctx.currentId !== options.id)
                return fallback;
            if (ctx.current == null)
                return fallback;
            // The editor's document wins on everything it carries; server-derived
            // keys it can't know about are restored from the fallback. See
            // `merge-derived.ts` — without this an archive block, a resolved
            // reference, anything an app attaches during its load, renders empty in
            // preview only.
            return mergeDerived(ctx.current, fallback);
        },
        encode(value, payload = {}) {
            const raw = value ?? '';
            if (ctx.current == null)
                return raw; // not in preview — leave the value clean
            const field = payload.field ?? ptField?.();
            if (!field)
                return raw; // nothing to navigate to
            return stegaEncode(raw || ' ', { ...payload, field });
        },
        edit(target) {
            const attrs = {};
            if (ctx.current == null)
                return attrs; // not in preview — no attributes
            // `data-aphex-field` is what the overlay keys on to make an element clickable,
            // so it is always set. Adding id/type routes the click to *that* document (the
            // studio opens it); leaving them off keeps the click on the open document, where
            // `arrayIndex` picks out a single row. Both are only emitted together — the
            // studio treats a cross-document click as such only when it has each half.
            attrs['data-aphex-field'] = target.field ?? 'title';
            if (target.id && target.type) {
                attrs['data-aphex-document-id'] = target.id;
                attrs['data-aphex-document-type'] = target.type;
            }
            if (target.arrayIndex != null) {
                attrs['data-aphex-array-index'] = String(target.arrayIndex);
            }
            return attrs;
        },
        image(img) {
            return {
                src: img?.asset?.url ?? null, // injected at load (server) or into the live doc (editor)
                alt: img?.alt || img?.asset?.alt || '' // per-placement override → asset default
            };
        }
    };
}

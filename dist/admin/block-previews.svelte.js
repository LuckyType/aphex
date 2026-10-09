/**
 * Rich-text block preview registry (client-side context).
 *
 * By default a custom Portable Text block renders in the editor as a generic card
 * (title/subtitle from its `preview` config). That's fine for data-ish blocks, but for
 * visual ones — an embed, a gallery, a button — authors expect to see the real thing
 * inline while writing (the Ghost/Sanity "what you see is what you get" editor).
 *
 * An app registers a preview per block `_type`; RichtextField resolves it and the
 * ProseMirror node view mounts it INSTEAD of the generic card. The preview still gets
 * `onEdit`/`onDelete` so the block stays editable and removable.
 *
 * Deliberately separate from the field-component registry: that one supplies *inputs*
 * (`field`/`value`/`onUpdate`); this one supplies *renderers* (`data`/`onEdit`). Same
 * idea, different contract.
 */
import { getContext, setContext } from 'svelte';
const BLOCK_PREVIEWS_KEY = Symbol.for('aphex.admin.block-previews');
/** Publish the block-preview lookup to descendants (call in the admin shell). */
export function setBlockPreviews(lookup) {
    setContext(BLOCK_PREVIEWS_KEY, lookup);
}
/** Resolve the lookup. Returns a no-op lookup outside the admin shell. */
export function useBlockPreviews() {
    return getContext(BLOCK_PREVIEWS_KEY) ?? (() => undefined);
}

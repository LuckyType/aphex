import { vercelStegaClean, vercelStegaCombine, vercelStegaDecode } from '@vercel/stega';
/**
 * Remove all stega-encoded data from a string or deep JSON structure.
 * Use in <svelte:head> (title, meta), alt text, aria-labels, comparisons.
 */
export function stegaClean(value) {
    return vercelStegaClean(value);
}
/**
 * Stamp a navigation payload onto a string as invisible stega characters.
 *
 * The CMS auto-encodes a document's own string fields, but values that aren't
 * literally in the document — a resolved `reference` label, a denormalized
 * title — have nothing to stamp. Encode those at render time so the overlay
 * treats them like any other clickable field. Returns the value unchanged if
 * it's empty.
 */
export function stegaEncode(value, payload) {
    if (!value)
        return value;
    return vercelStegaCombine(value, payload);
}
/** Decode the stega payload from a string. Returns null if not encoded. */
export function stegaDecode(value) {
    return vercelStegaDecode(value) ?? null;
}

/**
 * Should this field be rendered and validated?
 *
 * The single source of truth for the answer, deliberately: the admin renderer and
 * the server-side validator both call this. Two implementations would drift, and
 * the way they drift is "the form won't save and nothing on screen says why".
 *
 * A throwing condition resolves to *visible*. A broken predicate should surface
 * as a field that shouldn't be there, not as one that has silently vanished
 * along with whatever the editor typed into it.
 */
export function isFieldVisible(field, siblingData, documentData) {
    const hidden = field.hidden;
    if (typeof hidden !== 'function')
        return true;
    const sibling = siblingData ?? documentData ?? {};
    try {
        return !hidden({ siblingData: sibling, documentData: documentData ?? sibling });
    }
    catch {
        return true;
    }
}

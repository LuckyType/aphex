// Walks a document's data and collects every *asset* reference, with the field
// path it was found at.
//
// The sibling of `reference-walk.ts`, which collects document references and
// deliberately steps over image/file nodes because those point at the assets
// table rather than at documents. This one is the other half: it collects only
// those, because they are what the asset-reference index is built from.
//
// The path matters as much as the id. "This asset is used by 3 documents" is a
// number; "Homepage · Hero image" is something an editor can act on — and it is
// also what makes an orphaned reference diagnosable rather than mysterious.
/**
 * Collect every asset reference in a document's data.
 *
 * Deduplicated by `assetId` + `fieldPath`, so the same asset used twice in
 * different fields yields two rows, while the same asset at the same path (which
 * shouldn't happen, but costs nothing to guard) yields one.
 */
export function collectAssetReferences(data) {
    const found = new Map();
    walk(data, '', found);
    return Array.from(found.values());
}
/**
 * Every asset id reachable anywhere in the data, ignoring structure entirely.
 *
 * The unstructured twin of {@link collectAssetReferences}, and deliberately dumb:
 * it descends through everything and collects any `asset: { _ref }` it meets, at
 * any depth, under any wrapper, with no notion of which shapes are legitimate.
 * It therefore cannot tell you *where* a reference lives, which is why it is not
 * the indexer.
 *
 * It exists to check the indexer. The walker is a structural allowlist — it finds
 * references in the shapes it knows — while the delete guard is a substring scan
 * that finds them in shapes nobody anticipated. That asymmetry is permanent, and
 * every gap it has produced looked identical from the outside: an asset that
 * reads as unused and then refuses to delete. Comparing these two sets turns the
 * next such gap into a log line at rebuild time instead of a support question
 * months later.
 *
 * Not a substitute for the guard's scan: that one matches raw text, so it also
 * catches an id sitting somewhere this doesn't model at all.
 */
export function collectAssetIdsUnstructured(data) {
    const ids = new Set();
    const seen = new Set();
    const visit = (value) => {
        if (value == null || typeof value !== 'object')
            return;
        // Documents are JSON, so cycles shouldn't occur — but this runs over every
        // document in an organization during a rebuild, and an accidental cycle
        // must not turn a repair pass into a hang.
        if (seen.has(value))
            return;
        seen.add(value);
        if (Array.isArray(value)) {
            for (const item of value)
                visit(item);
            return;
        }
        const id = assetRefIn(value);
        if (id)
            ids.add(id);
        for (const nested of Object.values(value))
            visit(nested);
    };
    visit(data);
    return ids;
}
/**
 * The asset id held by `node.asset`, when that is a reference.
 *
 * `asset` is the key that makes a reference an *asset* reference — a `_ref`
 * under any other key points at the documents table and belongs to
 * `reference-walk.ts`.
 */
function assetRefIn(node) {
    if (node == null || typeof node !== 'object')
        return null;
    const ref = node.asset;
    if (ref?._type === 'reference' && typeof ref._ref === 'string' && ref._ref)
        return ref._ref;
    return null;
}
/**
 * @param skipOwnAsset - Don't record this node's own `asset`; the caller already
 *   recorded it at a better path. Set when descending into a wrapper's `data`,
 *   which would otherwise report the same reference twice — once as
 *   `content[3]` and once as `content[3].data`.
 */
function walk(value, path, found, skipOwnAsset = false) {
    if (value == null || typeof value !== 'object')
        return;
    if (Array.isArray(value)) {
        for (const [index, item] of value.entries()) {
            walk(item, `${path}[${index}]`, found);
        }
        return;
    }
    const obj = value;
    // Where the reference actually sits, in the two shapes that exist:
    //
    //   a plain image field   { _type: 'image', asset: { _ref } }
    //   a rich-text block     { _type: 'image', _key, data: { asset: { _ref } } }
    //
    // The second was missed entirely. Checking only `obj.asset` found nothing on
    // the block, and the recursion that would have reached `data.asset` ran into
    // the `_type === 'reference'` guard below and turned back — so every image
    // placed in block content was invisible to the index, while the delete guard's
    // `LIKE '%assetId%'` found it regardless of shape.
    //
    // That asymmetry is the whole failure mode of this file: a structure-blind
    // scan finds what a structure-aware walk does not model, so any gap here reads
    // as "unused" in the browser and "still referenced" at the point of deletion.
    // New wrappers belong here rather than worked around downstream.
    //
    // Recorded at the containing node's path rather than the inner `asset` key —
    // `coverImage` and `content[3]` are what an editor recognises,
    // `coverImage.asset` and `content[3].data.asset` are not.
    const ownAsset = skipOwnAsset ? null : assetRefIn(obj);
    const wrappedAsset = ownAsset ? null : assetRefIn(obj.data);
    const assetId = ownAsset ?? wrappedAsset;
    if (assetId) {
        const fieldPath = path || (typeof obj._type === 'string' ? obj._type : 'asset');
        found.set(`${assetId} ${fieldPath}`, { assetId, fieldPath });
    }
    // Keep descending regardless: an image object can carry nested fields of its
    // own, and a custom block may embed further media below it.
    // A document reference points at the documents table, not at assets — that is
    // `reference-walk.ts`'s job. Stopping here also prevents a `_ref` that happens
    // to be a document id from being recorded as an asset. Anything reached
    // *through* an `asset` key has already been collected above.
    if (obj._type === 'reference')
        return;
    for (const key of Object.keys(obj)) {
        // Underscore keys are structural (_type, _key, _ref), never content.
        if (key.startsWith('_'))
            continue;
        // A `data` whose asset was just credited to this node still gets walked —
        // it can hold further media — but must not re-report the one already taken.
        walk(obj[key], path ? `${path}.${key}` : key, found, key === 'data' && !!wrappedAsset);
    }
}

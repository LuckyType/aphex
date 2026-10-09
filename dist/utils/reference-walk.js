// Walks a document's data and collects every reference's target ID. Both
// singular and array refs share the same on-disk shape now —
// `{ _type: 'reference', _ref }` — so this can be schema-less.
//
// Asset references (image/file) wrap an Asset, not a document, and aren't
// subject to the publish workflow — so they're skipped (we only collect
// ids whose marker is exactly 'reference').
/**
 * Collect all referenced document IDs from a doc's data. The `schema` and
 * `registry` params are accepted for API compatibility but no longer used —
 * the unified ref shape makes them unnecessary.
 */
export function collectReferenceIds(data, _schema, _registry) {
    const ids = new Set();
    walk(data, ids);
    return Array.from(ids);
}
function walk(value, ids) {
    if (value == null)
        return;
    if (Array.isArray(value)) {
        for (const item of value)
            walk(item, ids);
        return;
    }
    if (typeof value !== 'object')
        return;
    const obj = value;
    if (obj._type === 'reference' && typeof obj._ref === 'string' && obj._ref) {
        ids.add(obj._ref);
        return;
    }
    // Image/file fields store asset refs ({ _type:'image', asset:{_type:'reference', _ref} })
    // that point to the assets table, not documents — skip them.
    if (obj._type === 'image' || obj._type === 'file')
        return;
    for (const key of Object.keys(obj)) {
        if (key.startsWith('_'))
            continue;
        walk(obj[key], ids);
    }
}

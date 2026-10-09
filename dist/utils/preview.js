/**
 * Walk a dot-path (e.g. `seo.title`) through an object. Returns the
 * terminal value, or `undefined` if any segment along the way is missing.
 *
 * Quoted strings (single or double) are treated as literals and returned
 * as-is, e.g. `'"My Title"'` → `'My Title'`. Useful for singletons or
 * any schema that needs a static preview title.
 */
export function readPath(item, path) {
    const match = path.match(/^(['"])(.+)\1$/);
    if (match)
        return match[2];
    let current = item;
    for (const segment of path.split('.')) {
        if (current == null)
            return undefined;
        current = current[segment];
    }
    return current;
}
/**
 * Coerce a value into a printable string for preview rows. Returns `null`
 * when the value isn't worth rendering (empty, nullish, non-primitive).
 */
function toPreviewString(value) {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed ? trimmed : null;
    }
    if (typeof value === 'number' && Number.isFinite(value))
        return String(value);
    if (typeof value === 'boolean')
        return value ? 'true' : 'false';
    return null;
}
/**
 * Conventional fallback field names for the title slot when a schema
 * doesn't declare a `preview.select.title`. Mirrors Sanity's heuristic
 * — the first non-empty string wins.
 */
const DEFAULT_TITLE_FIELDS = ['title', 'heading', 'name', 'label'];
/**
 * Run `preview.prepare` if defined: resolve every dot-path in `select`,
 * pass the resolved selection map to `prepare`, and return the result.
 * Returns `null` when no `prepare` is configured — callers should fall
 * back to direct `select.title` / `select.subtitle` reads in that case.
 */
function runPrepare(item, schema) {
    const prepare = schema?.preview?.prepare;
    if (!prepare)
        return null;
    const select = schema?.preview?.select ?? {};
    const selection = {};
    for (const [key, path] of Object.entries(select)) {
        selection[key] = readPath(item, path);
    }
    return prepare(selection);
}
/**
 * Resolve the title to display for an item (array row, document list row,
 * reference picker row, editor breadcrumb). Precedence: `preview.prepare()` →
 * literal `preview.title` → `select.title` dot-path → conventional field names →
 * schema title → type name.
 */
export function resolvePreviewTitle(item, schema, defaultTypeLabel) {
    const prepared = runPrepare(item, schema);
    if (prepared) {
        const resolved = toPreviewString(prepared.title);
        if (resolved)
            return resolved;
    }
    else {
        // Literal static override — used as-is, no data lookup.
        const literal = toPreviewString(schema?.preview?.title);
        if (literal)
            return literal;
        const configured = schema?.preview?.select?.title;
        if (configured) {
            const resolved = toPreviewString(readPath(item, configured));
            if (resolved)
                return resolved;
        }
        else {
            for (const name of DEFAULT_TITLE_FIELDS) {
                const resolved = toPreviewString(item?.[name]);
                if (resolved)
                    return resolved;
            }
        }
    }
    return schema?.title ?? defaultTypeLabel ?? 'Untitled';
}
/**
 * Resolve the subtitle to display for an item. Returns `null` when no
 * subtitle is configured or the configured field is empty — callers
 * should branch on the null and skip rendering the subtitle line.
 */
export function resolvePreviewSubtitle(item, schema) {
    const prepared = runPrepare(item, schema);
    if (prepared)
        return toPreviewString(prepared.subtitle);
    const configured = schema?.preview?.select?.subtitle;
    if (!configured)
        return null;
    return toPreviewString(readPath(item, configured));
}

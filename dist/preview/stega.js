import { vercelStegaCombine, vercelStegaClean, vercelStegaDecode } from '@vercel/stega';
import { getSchemaByName } from '../schema-utils/utils.js';
/**
 * Resolve the `fields` for an array member / block. Members are usually named type
 * references (`{ type: 'doctorGridBlock' }`) with no inline `fields`, so without the
 * schema registry the encoder can't reach into them and the item's text is never
 * stega-encoded (invisible to click-to-edit). Prefer an inline `fields`, otherwise
 * look the type up in the registry.
 */
function resolveFields(typeRef, itemType, schemas) {
    if (typeRef?.fields)
        return typeRef.fields;
    const name = itemType ?? typeRef?.type;
    if (!name)
        return undefined;
    const schema = getSchemaByName(schemas, name);
    return schema && 'fields' in schema ? schema.fields : undefined;
}
/**
 * Remove all stega-encoded data from a string or deep JSON structure.
 * Use in <svelte:head> (title, meta), alt text, aria-labels — anywhere the raw
 * string is needed without invisible characters.
 */
export function stegaClean(value) {
    return vercelStegaClean(value);
}
/** Decode the stega payload from a string. Returns null if not encoded. */
export function stegaDecode(value) {
    return (vercelStegaDecode(value) ?? null);
}
/**
 * Recursively encode all string-bearing fields in a document with their top-level
 * field name. Handles: string/text/url, string arrays, object subfields, and
 * portable text blocks (including custom block types like callout, codeBlock).
 *
 * Every nested string always encodes the *top-level* field name so that clicking
 * in the preview navigates to the correct editor field.
 */
export function stegaEncodeDocument(data, fields, schemas = []) {
    const result = { ...data };
    for (const field of fields) {
        const val = result[field.name];
        if (val == null)
            continue;
        // objectPath is undefined at root — each field IS the top-level, no sub-path needed
        result[field.name] = encodeFieldValue(val, field, field.name, undefined, schemas);
    }
    return result;
}
// ---------------------------------------------------------------------------
// Internal helpers — topLevel is always the document root field name so the
// editor knows which field to scroll to; objectPath carries the dotted sub-path
// so the editor can drill into nested inputs.
// ---------------------------------------------------------------------------
function encodeFieldValue(val, field, topLevel, objectPath, schemas, arrayIndex) {
    if (val == null)
        return val;
    const path = objectPath ? `${objectPath}.${field.name}` : field.name;
    switch (field.type) {
        case 'string':
        case 'text':
        case 'url':
            if (typeof val === 'string' && val) {
                const payload = { field: topLevel };
                // Only include objectPath for nested fields (not the top-level field itself)
                if (objectPath)
                    payload.objectPath = path;
                /*
                 * The row of the top-level array this value lives in.
                 *
                 * `objectPath` already spells out `[2].richText`, but the studio picks a
                 * row out of a page-builder array by `arrayIndex` — the same key
                 * `ve.edit({ field, arrayIndex })` emits. Without it, clicking the text
                 * of the third call-to-action on a page revealed the `layout` array and
                 * stopped there, leaving the author to find their own block.
                 */
                if (arrayIndex !== undefined)
                    payload.arrayIndex = arrayIndex;
                return vercelStegaCombine(val, payload);
            }
            return val;
        case 'array':
            if (!Array.isArray(val))
                return val;
            // Only forward objectPath when truly nested (inside an object); top-level
            // arrays must NOT get an objectPath or the arrayIndex navigation branch is skipped.
            return encodeArray(val, field.of, topLevel, objectPath ? path : undefined, schemas, arrayIndex);
        case 'object': {
            // Inline `fields`, or a named object type resolved from the registry.
            const objFields = field.fields ?? resolveFields(field, field.type, schemas);
            if (typeof val !== 'object' || !objFields)
                return val;
            return encodeObject(val, objFields, topLevel, path, schemas, arrayIndex);
        }
        // image, file, reference, slug, number, boolean, date, datetime — not text, skip.
        // Image click-to-edit is handled at render time (the frontend stega-encodes the
        // *effective* alt — override or asset default — so every image is clickable, not
        // just ones with a per-placement override).
        default:
            return val;
    }
}
function encodeArray(items, of, topLevel, objectPath, schemas, 
/**
 * The row index of the *outermost* array this content sits in, once one has
 * been established. It is what the studio uses to open a specific page-builder
 * row, so a nested array (a content block's columns) must not overwrite it
 * with its own index — the editor navigates to the block, then the block's own
 * form shows the column.
 */
inheritedIndex) {
    const hasBlock = of.some((t) => t.type === 'block');
    const firstType = of[0]?.type;
    if (hasBlock) {
        // Portable text — encode spans within blocks and string fields in custom block types
        return encodePortableText(items, of, topLevel, schemas, inheritedIndex);
    }
    if (firstType === 'string' || firstType === 'text') {
        // Primitive string array (e.g. tags) — include the item's array index
        return items.map((item, arrayIndex) => {
            if (typeof item !== 'string' || !item)
                return item;
            const payload = { field: topLevel, arrayIndex };
            if (objectPath)
                payload.objectPath = objectPath;
            return vercelStegaCombine(item, payload);
        });
    }
    // Array of objects — either inline `fields` or named object-type references
    // (`{ type: 'doctorGridBlock' }`) resolved from the schema registry. The latter is
    // the common page-builder case, so resolving is what makes those blocks clickable.
    return items.map((item, arrayIndex) => {
        if (!item || typeof item !== 'object')
            return item;
        const obj = item;
        const itemType = typeof obj._type === 'string' ? obj._type : undefined;
        const typeRef = of.find((t) => t.name === obj._type || t.type === obj._type) ?? of[0];
        const fields = resolveFields(typeRef, itemType, schemas);
        if (!fields)
            return item;
        const itemPath = objectPath ? `${objectPath}[${arrayIndex}]` : `[${arrayIndex}]`;
        // First array wins: an inherited index means we're already inside a
        // page-builder row, and that outer row is what the studio should open.
        return encodeObject(obj, fields, topLevel, itemPath, schemas, inheritedIndex ?? arrayIndex);
    });
}
function encodeObject(obj, fields, topLevel, objectPath, schemas, arrayIndex) {
    const result = { ...obj };
    for (const field of fields) {
        const val = result[field.name];
        if (val == null)
            continue;
        result[field.name] = encodeFieldValue(val, field, topLevel, objectPath, schemas, arrayIndex);
    }
    return result;
}
/** Encode portable text: spans in standard blocks + string fields in custom block types. */
function encodePortableText(blocks, of, topLevel, schemas, 
/** Row of the page-builder array this rich text belongs to, when nested in one. */
arrayIndex) {
    return blocks.map((block, blockIndex) => {
        if (!block || typeof block !== 'object')
            return block;
        const b = block;
        if (b._type === 'block' && Array.isArray(b.children)) {
            // Standard text block — encode each span's text with its block index so the
            // editor can position the cursor at the exact block when clicked.
            return {
                ...b,
                children: b.children.map((child) => {
                    if (!child || typeof child !== 'object')
                        return child;
                    const span = child;
                    if (span._type === 'span' && typeof span.text === 'string' && span.text) {
                        return {
                            ...span,
                            text: vercelStegaCombine(span.text, {
                                field: topLevel,
                                blockIndex,
                                // Rich text inside a page-builder block: `blockIndex` locates
                                // the paragraph within the body, `arrayIndex` locates the
                                // block within `layout`. Without the latter a click on a
                                // call-to-action's own copy revealed the array and stopped.
                                ...(arrayIndex !== undefined ? { arrayIndex } : {})
                            })
                        };
                    }
                    return child;
                })
            };
        }
        // Built-in image block — click-to-edit is stamped at render time (the frontend
        // stega-encodes the effective alt with this block's _key), so no encoding here.
        if (b._type === 'image')
            return block;
        // Custom block type (callout, codeBlock, etc.) — encode string fields, carrying
        // blockIndex so clicking them opens the block's edit modal in the editor. Fields
        // come from an inline definition or a named object type in the registry.
        const typeRef = of.find((t) => t.name === b._type || t.type === b._type);
        const fields = resolveFields(typeRef, typeof b._type === 'string' ? b._type : undefined, schemas);
        if (fields) {
            return encodeCustomBlock(b, fields, topLevel, blockIndex, arrayIndex);
        }
        return block;
    });
}
/** Encode string fields of a custom block with { field, blockIndex, blockKey } so the editor can open the modal. */
function encodeCustomBlock(obj, fields, topLevel, blockIndex, arrayIndex) {
    const result = { ...obj };
    const blockKey = typeof obj._key === 'string' ? obj._key : undefined;
    for (const field of fields) {
        const val = result[field.name];
        if (!val)
            continue;
        if ((field.type === 'string' || field.type === 'text' || field.type === 'url') &&
            typeof val === 'string') {
            result[field.name] = vercelStegaCombine(val, {
                field: topLevel,
                blockIndex,
                blockKey,
                ...(arrayIndex !== undefined ? { arrayIndex } : {})
            });
        }
    }
    return result;
}

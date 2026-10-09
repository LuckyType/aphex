// schema-utils/desugar.ts
//
// Shared machinery for `aphex/schema/transform` parts that desugar a custom field
// keyword into a real field — e.g. `{ type: 'color' }` → the color `object`, or
// `{ type: 'seo' }` → the SEO `object`.
//
// Every such transform has the same two jobs, and the second is easy to get wrong:
//
//   1. Walk the whole schema list — fields, nested object fields, and array members.
//   2. Replace the sugar field WITHOUT losing what the author wrote on it.
//
// Hand-rolled transforms tended to rebuild the field from a hand-picked subset
// (`name`/`title`/`description`/`group`), which silently dropped `access` — turning a
// restricted field unrestricted — along with `validation` and every group after the
// first. Preservation is the default here so a plugin author can't forget it: the
// builder supplies only the shape, and the authored field is layered back on top.
/**
 * Layer the authored field back over the built one.
 *
 * The builder owns structure (`type`, `fields`); the author owns intent (`group`,
 * `validation`, `access`, and any property added to BaseField later — hence a
 * spread rather than an allowlist, which would silently go stale).
 */
function preserveAuthored(authored, built, sugarKeys) {
    const rest = { ...authored };
    delete rest.type;
    for (const key of sugarKeys)
        delete rest[key];
    const builtRecord = built;
    const merged = {
        ...builtRecord,
        ...rest,
        // Re-assert what the desugaring defines: the author wrote `type: 'color'`,
        // not the object it expands to.
        type: builtRecord.type,
        // An author who explicitly asked for a different widget still wins; otherwise
        // the builder's widget is the whole point of the field type.
        input: rest.input ?? builtRecord.input,
        // Merged, not replaced: the builder derives options from the sugar keys
        // (color's `alpha` → `inputOptions.alpha`), so letting an authored
        // `inputOptions` win wholesale would silently drop them. Authored keys still
        // win individually.
        inputOptions: mergeInputOptions(builtRecord.inputOptions, rest.inputOptions)
    };
    if ('fields' in builtRecord)
        merged.fields = builtRecord.fields;
    return merged;
}
/** Combine the builder's derived widget options with any the author declared. */
function mergeInputOptions(built, authored) {
    const isRecord = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
    if (!isRecord(built))
        return isRecord(authored) ? authored : undefined;
    if (!isRecord(authored))
        return built;
    return { ...built, ...authored };
}
function expandFields(fields, options) {
    const sugarKeys = options.sugarKeys ?? [];
    return fields.map((field) => {
        if (field.type === options.type) {
            return preserveAuthored(field, options.build(field), sugarKeys);
        }
        if (field.type === 'object' && Array.isArray(field.fields)) {
            return { ...field, fields: expandFields(field.fields, options) };
        }
        if (field.type === 'array' && Array.isArray(field.of)) {
            return { ...field, of: field.of.map((member) => expandMember(member, options)) };
        }
        return field;
    });
}
/** Array `of` members are `TypeReference`s, not `Field`s — expand them the same way. */
function expandMember(member, options) {
    if (member.type === options.type) {
        // A member names a *type*, so `name` is often absent — but builders take a
        // named field. Fall back to the sugar keyword so the expansion keeps its
        // identity (`{ of: [{ type: 'color' }] }` stays a recognisable color member
        // instead of becoming an anonymous object).
        const authored = { ...member, name: member.name ?? options.type };
        const built = options.build(authored);
        return preserveAuthored(authored, built, options.sugarKeys ?? []);
    }
    if (Array.isArray(member.fields)) {
        return { ...member, fields: expandFields(member.fields, options) };
    }
    return member;
}
/**
 * Desugar every `{ type: <options.type> }` field across a schema list, recursing into
 * nested objects and array members, preserving everything the author declared.
 *
 * Intended as the body of an `aphex/schema/transform` part, so it runs identically in
 * the engine, the admin, and the type generator — nothing downstream ever sees the
 * sugar keyword.
 */
export function desugarFieldType(schemas, options) {
    return schemas.map((schema) => 'fields' in schema && Array.isArray(schema.fields)
        ? { ...schema, fields: expandFields(schema.fields, options) }
        : schema);
}

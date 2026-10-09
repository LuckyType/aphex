export function defineEvent(type, schema) {
    return {
        type,
        schema,
        parse: (payload) => schema.parse(payload)
    };
}

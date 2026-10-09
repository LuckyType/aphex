/**
 * Convert a string to PascalCase.
 * Handles hyphens, underscores, and camelCase boundaries.
 *
 * @example
 * toPascalCase('type-name')        // 'TypeName'
 * toPascalCase('my_field')         // 'MyField'
 * toPascalCase('parentName')       // 'ParentName'
 */
export function toPascalCase(str) {
    return str.replace(/(^|[-_])(\w)/g, (_, _sep, c) => c.toUpperCase());
}
/**
 * Convert a string to camelCase.
 * Handles hyphens, underscores, and existing casing.
 *
 * @example
 * toCamelCase('type-name')         // 'typeName'
 * toCamelCase('my_field')          // 'myField'
 * toCamelCase('alreadyCamel')      // 'alreadyCamel'
 */
export function toCamelCase(str) {
    const pascal = toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

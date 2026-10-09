/**
 * Convert a string to PascalCase.
 * Handles hyphens, underscores, and camelCase boundaries.
 *
 * @example
 * toPascalCase('type-name')        // 'TypeName'
 * toPascalCase('my_field')         // 'MyField'
 * toPascalCase('parentName')       // 'ParentName'
 */
export declare function toPascalCase(str: string): string;
/**
 * Convert a string to camelCase.
 * Handles hyphens, underscores, and existing casing.
 *
 * @example
 * toCamelCase('type-name')         // 'typeName'
 * toCamelCase('my_field')          // 'myField'
 * toCamelCase('alreadyCamel')      // 'alreadyCamel'
 */
export declare function toCamelCase(str: string): string;
//# sourceMappingURL=string-case.d.ts.map
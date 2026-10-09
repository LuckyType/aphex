import type { SchemaType } from '../types/schemas.js';
/**
 * Check if a field name is reserved
 */
export declare function isReservedFieldName(fieldName: string): boolean;
/** Field names that conflict with system properties and can't be used in a schema. */
export declare const RESERVED_FIELDS: readonly string[];
/** Primitive (leaf) field types. The single runtime source of truth. */
export declare const PRIMITIVE_FIELD_TYPES: string[];
/** All valid field types (primitives + containers). */
export declare const VALID_FIELD_TYPES: string[];
/**
 * Validate all schema references to ensure they exist
 */
export declare function validateSchemaReferences(schemas: SchemaType[]): void;
//# sourceMappingURL=validator.d.ts.map
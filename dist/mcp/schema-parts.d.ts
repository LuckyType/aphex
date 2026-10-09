import type { Field, SchemaType, TypeReference } from '../types/schemas.js';
/** Characters of compact JSON above which a schema is answered in parts. */
export declare const SCHEMA_INLINE_LIMIT = 50000;
type InlineObjectType = TypeReference & {
    name: string;
    fields: Field[];
};
export declare function schemaIsTooLarge(schema: SchemaType): boolean;
export declare function stubFields(fields: Field[]): Field[];
/** The names of the inline object types a stubbed array holds, if it holds any. */
export declare function stubbedItemTypes(field: Field): string[];
export interface ObjectTypePart {
    definition: InlineObjectType;
    foundAt: string[];
    /** Where the same type is stored with other fields, e.g. a block inside a container block. */
    variants: Array<{
        foundAt: string[];
        addsFields: Field[];
        changesFields: Field[];
        dropsFields: string[];
    }>;
}
/**
 * One inline object type of a schema, stubbed like the schema itself. Its
 * occurrences are grouped by definition; the first one met (the shallowest)
 * is answered whole and the others as their difference from it, so six
 * identical container levels cost one entry rather than six copies.
 */
export declare function objectTypePart(schema: SchemaType, typeName: string): ObjectTypePart | null;
/** Every inline object type a schema holds in an array, by name, at any depth. */
export declare function objectTypeNames(schema: SchemaType): string[];
export {};
//# sourceMappingURL=schema-parts.d.ts.map
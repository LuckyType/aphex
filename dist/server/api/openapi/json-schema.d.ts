/**
 * Field → JSON Schema, for the per-instance half of the OpenAPI document.
 *
 * The generic request contracts (`api/schemas/*.ts`) describe `draftData` as
 * `Record<string, unknown>`, which is honest but useless to a reader: the whole
 * question when you POST a document is *what goes in there*, and the answer only
 * exists in this instance's `schemaTypes`. So the spec gets a real component per
 * document type, generated at request time from the live config.
 *
 * This is the third walker over `Field` in the codebase — `type-gen.ts` emits
 * TypeScript, `graphql/schema.ts` emits SDL, this emits JSON Schema. The *emit*
 * genuinely differs each time (strings vs strings vs objects), but the
 * classification underneath must not: required-ness comes from the canonical
 * `isFieldRequired` in `field-validation/utils`, the same predicate the validator
 * itself runs, so a field that the API will reject as missing is the same field
 * the spec marks required.
 *
 * (Note: `graphql/schema.ts` has its own local `isFieldRequired` that string-matches
 * the validation function source. It disagrees with this one on any rule that
 * mentions "required" without being required. Not changed here — fixing it moves
 * GraphQL non-null markers, which is a breaking change for clients and deserves
 * its own decision.)
 */
import type { Field, SchemaType } from '../../../types/schemas.js';
/** A JSON Schema object, loose enough for the subset OpenAPI 3.1 accepts. */
export type JsonSchema = Record<string, unknown>;
/** Shared component schemas referenced by `$ref` from generated field shapes. */
export declare const SHARED_VALUE_COMPONENTS: Record<string, JsonSchema>;
/**
 * The depth=0 *write* shape of one field as JSON Schema.
 *
 * Write shape, not read shape: references stay `{_ref}` rather than the resolved
 * document, because that is what a caller sends and what the validator checks.
 */
export declare function fieldToJsonSchema(field: Field, schemaMap: Map<string, SchemaType>, seen?: Set<string>): JsonSchema;
/** Turn a list of fields into an object schema with a `required` array. */
export declare function fieldsToJsonSchema(fields: Field[], schemaMap: Map<string, SchemaType>, seen?: Set<string>): JsonSchema;
/** PascalCase component name for a schema type, e.g. `post` → `PostData`. */
export declare function componentName(schemaName: string): string;
/**
 * Every schema type in the instance as components: `<Type>Data` for documents
 * (the `draftData`/`data` payload) and the object types they reference.
 */
export declare function buildSchemaComponents(schemaTypes: SchemaType[]): Record<string, JsonSchema>;
//# sourceMappingURL=json-schema.d.ts.map
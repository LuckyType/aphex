/**
 * Type generator for Aphex CMS
 * Generates TypeScript types from schema definitions with module augmentation
 */
import type { SchemaType, Field } from './types/schemas.js';
/**
 * The depth=0 write shape (TypeScript type string) for a single field, e.g.
 * `string` for a slug, `Reference<author>` for a reference, `ImageValue` for an
 * image. Same mapping `generate-types` uses to emit `generated-types.ts`, so
 * agent-facing schema introspection (MCP `get_schema`) can derive value shapes
 * from the one source of truth instead of hand-authoring a parallel list.
 */
export declare function fieldWriteShape(field: Field, schemas: SchemaType[]): string;
/**
 * Generate complete TypeScript types file with module augmentation
 */
export declare function generateTypes(schemas: SchemaType[]): string;
export declare function generateTypesFromConfig(schemaPath: string, outputPath: string, pluginsPath?: string): Promise<void>;
//# sourceMappingURL=type-gen.d.ts.map
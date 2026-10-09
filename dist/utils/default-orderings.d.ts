import type { Ordering, SchemaType } from '../types/schemas.js';
/**
 * Generate default orderings for a schema following Sanity's heuristics:
 * 1. If the schema has custom orderings defined, use those
 * 2. Otherwise, look for common title-like fields (title, name, label, etc.)
 * 3. If no common fields, generate orderings for all primitive fields
 * 4. Always include createdAt and updatedAt meta fields
 */
export declare function getOrderingsForSchema(schema: SchemaType): Ordering[];
//# sourceMappingURL=default-orderings.d.ts.map
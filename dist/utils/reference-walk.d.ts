import type { SchemaType } from '../types/schemas.js';
/**
 * Collect all referenced document IDs from a doc's data. The `schema` and
 * `registry` params are accepted for API compatibility but no longer used —
 * the unified ref shape makes them unnecessary.
 */
export declare function collectReferenceIds(data: unknown, _schema?: SchemaType | null, _registry?: SchemaType[]): string[];
//# sourceMappingURL=reference-walk.d.ts.map
import type { Field, SchemaType } from './types/schemas.js';
import type { Auth } from './types/auth.js';
/**
 * Return the set of field names the caller may NOT read.
 * Fields with no `access.read` list are readable by default.
 */
export declare function hiddenReadFields(schema: SchemaType, auth: Auth | undefined): Set<string>;
/**
 * Return the set of field names the caller may NOT write.
 * Fields with no `access.update` list are writable by default.
 */
export declare function hiddenWriteFields(schema: SchemaType, auth: Auth | undefined): Set<string>;
/**
 * Strip read-hidden fields from a document payload shape in place.
 * Safe to call on undefined / non-object values (returns the input).
 */
export declare function stripHiddenFields<T extends Record<string, unknown>>(data: T | null | undefined, hidden: ReadonlySet<string>): T | null | undefined;
/**
 * Remove write-locked fields from incoming mutation data. Prevents a caller
 * with collection-level update from silently overwriting fields the schema
 * protects at the field level.
 */
export declare function dropLockedWrites<T extends Record<string, unknown>>(data: T, locked: ReadonlySet<string>): T;
/**
 * Extract the raw field definitions for reading (not mutating).
 * Kept separate from hiddenReadFields so callers can iterate fields directly
 * when they need richer context than the name set.
 */
export declare function fieldByName(schema: SchemaType, name: string): Field | undefined;
//# sourceMappingURL=field-access.d.ts.map
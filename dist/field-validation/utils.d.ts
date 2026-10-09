import type { Field, SchemaType } from '../types/index.js';
export interface ValidationError {
    level: 'error' | 'warning' | 'info';
    message: string;
    /**
     * Which of the two questions this error answers.
     *
     * `structural` — the data cannot be interpreted as the schema at all: wrong
     * JSON shape for the field type, or a key the schema never declared. Never a
     * legitimate work-in-progress state, so it's rejected on **every** write,
     * drafts included. This is the class an agent or a bad client produces.
     *
     * `content` — the data is the right shape but isn't finished: required fields
     * missing, ranges exceeded, cross-field invariants unmet. Perfectly legitimate
     * mid-edit, so it's only enforced at publish.
     *
     * Defaults to `content` when unset — the conservative direction, since
     * mislabelling a rule error as structural would block saving a draft.
     */
    kind?: 'structural' | 'content';
}
export interface FieldErrors {
    field: string;
    errors: string[];
    kind: 'structural' | 'content';
}
export interface DocumentValidationResult {
    isValid: boolean;
    errors: FieldErrors[];
    /**
     * The subset of `errors` that no draft may carry. Empty on a merely
     * incomplete document; non-empty means the payload is malformed.
     */
    structuralErrors: FieldErrors[];
    normalizedData: Record<string, any>;
}
/**
 * Check if a field is required based on its validation rules
 */
export declare function isFieldRequired(field: Field): boolean;
/**
 * Structural (shape) validation for a field's stored value — the depth=0 write
 * shape. This catches a caller (notably an AI agent over MCP) sending the wrong
 * JSON shape that presence/required checks would miss: a slug as `{ current }`
 * (Sanity's convention — AphexCMS stores slugs as plain strings), or a
 * reference/image missing its `_ref`. Runs before the user's Rule validation
 * and only when a value is meaningfully present (absent/empty is a required-ness
 * concern, handled separately), so optional and half-filled fields are left
 * alone. Returns an error message, or null when the shape is acceptable.
 *
 * Intentionally conservative: only unambiguous mismatches error, and empty
 * placeholders (`''`, an image with no `asset`) are treated as absent so the
 * admin's in-progress edit states don't trip it.
 */
export declare function validateValueShape(field: Field, value: unknown): string | null;
/**
 * Validate a field value against its validation rules
 */
export declare function validateField(field: Field, value: any, context?: any): Promise<{
    isValid: boolean;
    errors: ValidationError[];
}>;
/**
 * Get validation CSS classes for input styling
 */
export declare function getValidationClasses(hasErrors: boolean): string;
/**
 * Validate an entire document's data against a schema
 * This function:
 * 1. Normalizes date fields (converts user format to ISO for storage)
 * 2. Converts ISO dates to user format for validation
 * 3. Validates all fields and returns errors
 * 4. Returns normalized data (with ISO dates) for storage
 *
 * @param schema - The schema type containing field definitions
 * @param data - The document data to validate
 * @param context - Optional context to pass to field validators
 * @returns Validation result with isValid flag, errors, and normalized data
 */
export declare function validateDocumentData(schema: SchemaType, data: Record<string, any>, context?: any): Promise<DocumentValidationResult>;
//# sourceMappingURL=utils.d.ts.map
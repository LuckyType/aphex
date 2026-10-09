import type { SchemaType } from '../types/index.js';
/**
 * Convert a date value to user format for validation
 * Handles both ISO format and user format inputs
 */
export declare function convertDateToUserFormat(value: string, userFormat: string): string;
/**
 * Convert a date value to ISO format for storage
 * Returns ISO if already valid, or original value if invalid
 */
export declare function convertDateToISO(value: string, userFormat: string): string;
/**
 * Convert a datetime value to user format for validation
 * Handles both ISO datetime and user format inputs
 */
export declare function convertDateTimeToUserFormat(value: string, dateFormat: string, timeFormat?: string): string;
/**
 * Convert a datetime value to ISO UTC format for storage
 * Returns ISO UTC if already valid, or original value if invalid
 */
export declare function convertDateTimeToISO(value: string, dateFormat: string, timeFormat?: string): string;
/**
 * Normalize date fields in data object
 * Converts dates to ISO for storage and creates a parallel object with user-formatted dates for validation
 */
export declare function normalizeDateFields(data: Record<string, any>, schema: SchemaType): {
    normalizedData: Record<string, any>;
    dataForValidation: Record<string, any>;
};
//# sourceMappingURL=date-utils.d.ts.map
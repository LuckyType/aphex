/**
 * Helper functions for initialValue date/datetime patterns
 * These can be used directly as initialValue in field definitions
 *
 * Note: Returns values in storage format (ISO),
 * which will be converted to the user's configured display format by the field components
 */
/**
 * Returns the current date in YYYY-MM-DD format (storage format)
 * Usage: initialValue: currentDate
 */
export declare function currentDate(): string;
/**
 * Returns a specific date offset from today
 * Usage: initialValue: () => dateFromToday(7) // 7 days from now
 * Usage: initialValue: () => dateFromToday(-7) // 7 days ago
 */
export declare function dateFromToday(days: number): string;
/**
 * Returns the first day of the current month
 * Usage: initialValue: firstDayOfMonth
 */
export declare function firstDayOfMonth(): string;
/**
 * Returns the last day of the current month
 * Usage: initialValue: lastDayOfMonth
 */
export declare function lastDayOfMonth(): string;
/**
 * Returns the current datetime in ISO UTC format (storage format)
 * Usage: initialValue: currentDateTime
 */
export declare function currentDateTime(): string;
/**
 * Returns a datetime offset from now in ISO UTC format
 * Usage: initialValue: () => dateTimeFromNow(1, 'hour') // 1 hour from now
 * Usage: initialValue: () => dateTimeFromNow(-30, 'minute') // 30 minutes ago
 */
export declare function dateTimeFromNow(amount: number, unit: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'): string;
/**
 * Returns the start of the current day in ISO UTC format
 * Usage: initialValue: startOfToday
 */
export declare function startOfToday(): string;
/**
 * Returns the end of the current day in ISO UTC format
 * Usage: initialValue: endOfToday
 */
export declare function endOfToday(): string;
//# sourceMappingURL=initial-value-helpers.d.ts.map
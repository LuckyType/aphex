import { Time } from '@internationalized/date';
/** A stored time, or undefined for blank or anything not a valid `HH:MM`. */
export declare function readTime(value: unknown): Time | undefined;
/** The `HH:MM` to store, or blank while the field is empty or half typed. */
export declare function writeTime(time: Time | undefined): string;
//# sourceMappingURL=time-of-day.d.ts.map
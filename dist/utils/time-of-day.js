// A time of day as the Studio stores it, `HH:MM` on a 24-hour clock, to and
// from the `Time` value bits-ui's TimeField edits.
import { Time } from '@internationalized/date';
const HH_MM = /^(\d{2}):(\d{2})$/;
/** A stored time, or undefined for blank or anything not a valid `HH:MM`. */
export function readTime(value) {
    if (typeof value !== 'string')
        return undefined;
    const match = HH_MM.exec(value);
    if (!match)
        return undefined;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour > 23 || minute > 59)
        return undefined;
    return new Time(hour, minute);
}
/** The `HH:MM` to store, or blank while the field is empty or half typed. */
export function writeTime(time) {
    if (!time)
        return '';
    return `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;
}

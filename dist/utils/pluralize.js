/**
 * Simple English pluralization.
 * Handles common patterns: y→ies, s/sh/ch/x/z→es, otherwise appends s.
 */
export function pluralize(word) {
    if (!word)
        return word;
    if (/[sxz]$/i.test(word) || /[sc]h$/i.test(word)) {
        return word + 'es';
    }
    if (/[^aeiou]y$/i.test(word)) {
        return word.slice(0, -1) + 'ies';
    }
    return word + 's';
}

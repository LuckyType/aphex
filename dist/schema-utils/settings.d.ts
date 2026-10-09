import type { SettingsField } from '../types/schemas.js';
/** A normalized select option: what the user sees, and what gets stored. */
export interface SettingsListItem {
    title: string;
    value: string;
}
/**
 * The select options for a settings field, normalized from `StringField.list`'s
 * loose shape (bare strings, or `{title, value}` objects) — empty when the field
 * isn't a select.
 *
 * A `DependentList` yields no options: its valid values are a function of another
 * field's value, which settings doesn't resolve. The panel renders such a field as a
 * free-text input, so the validator must not treat it as a closed set either.
 */
export declare function settingsListItems(field: SettingsField): SettingsListItem[];
//# sourceMappingURL=settings.d.ts.map
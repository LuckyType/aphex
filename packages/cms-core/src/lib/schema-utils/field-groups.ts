import type { Field, FieldGroup, Fieldset } from '../types/schemas';
import { isFieldVisible } from './visibility';

/** Whether `field` belongs to the group named `groupName` (`group` may be a string or a list). */
export function fieldInGroup(field: { group?: string | string[] }, groupName: string): boolean {
	if (!field.group) return false;
	return Array.isArray(field.group) ? field.group.includes(groupName) : field.group === groupName;
}

/**
 * The field group tabs an editor shows: those not marked `hidden` that hold at
 * least one field the editor would render. A group whose fields are all hidden
 * by their `hidden` condition (or not readable, `isHidden`) would open an empty
 * pane, so it is left out until one of its fields applies again.
 */
export function visibleFieldGroups(
	groups: FieldGroup[] | undefined,
	fields: Field[],
	documentData: Record<string, unknown> | undefined,
	isHidden: (field: Field) => boolean = () => false
): FieldGroup[] {
	return (groups ?? []).filter(
		(group) =>
			!group.hidden &&
			fields.some(
				(field) =>
					fieldInGroup(field, group.name) &&
					!isHidden(field) &&
					isFieldVisible(field, documentData, documentData)
			)
	);
}

/**
 * Whether the editor needs its field group tabs at all. With one group left
 * that holds every field the editor would render, "All fields" and that
 * group show the same fields, so the two tabs only take room. Without "All
 * fields" (`allFields` false) a single group is one tab holding everything,
 * so tabs need two groups.
 */
export function fieldGroupTabsNeeded(
	visibleGroups: FieldGroup[],
	fields: Field[],
	documentData: Record<string, unknown> | undefined,
	isHidden: (field: Field) => boolean = () => false,
	allFields = true
): boolean {
	const [first, ...rest] = visibleGroups;
	if (!first) return false;
	if (rest.length > 0) return true;
	if (!allFields) return false;
	const only = first.name;
	return fields.some(
		(field) =>
			!fieldInGroup(field, only) &&
			!isHidden(field) &&
			isFieldVisible(field, documentData, documentData)
	);
}

/**
 * The tab a field shows under: the first visible group it belongs to. A field
 * in none of them shows under "All fields" (`'all'`), or, where the editor
 * leaves "All fields" out, under the first tab, so no field is unreachable.
 */
export function fieldGroupTab(
	field: { group?: string | string[] },
	visibleGroups: FieldGroup[],
	allFields: boolean
): string {
	const own = visibleGroups.find((group) => fieldInGroup(field, group.name));
	if (own) return own.name;
	return allFields ? 'all' : (visibleGroups[0]?.name ?? 'all');
}

/**
 * How many fields the tab named `tab` shows: those the editor would render
 * whose `fieldGroupTab` is `tab` (every rendered field for `'all'`), counted
 * as the panels' tabs count theirs.
 */
export function fieldGroupTabCount(
	tab: string,
	visibleGroups: FieldGroup[],
	fields: Field[],
	documentData: Record<string, unknown> | undefined,
	allFields: boolean,
	isHidden: (field: Field) => boolean = () => false
): number {
	return fields.filter(
		(field) =>
			!isHidden(field) &&
			isFieldVisible(field, documentData, documentData) &&
			(tab === 'all' ||
				fieldInGroup(field, tab) ||
				fieldGroupTab(field, visibleGroups, allFields) === tab)
	).length;
}

/**
 * The fieldset title the form shows over `field`: the title of the fieldset
 * it names, when the field shown before it in the same tab (`before`) names
 * another fieldset or none, so each run of fields in one fieldset is headed
 * once.
 */
export function fieldsetHeading(
	fieldsets: readonly Fieldset[] | undefined,
	field: { fieldset?: string },
	before: { fieldset?: string } | undefined
): string | null {
	if (!field.fieldset || before?.fieldset === field.fieldset) return null;
	return fieldsets?.find((set) => set.name === field.fieldset)?.title ?? null;
}

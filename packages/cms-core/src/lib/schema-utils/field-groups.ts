import type { Field, FieldGroup } from '../types/schemas';
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
 * group show the same fields, so the two tabs only take room.
 */
export function fieldGroupTabsNeeded(
	visibleGroups: FieldGroup[],
	fields: Field[],
	documentData: Record<string, unknown> | undefined,
	isHidden: (field: Field) => boolean = () => false
): boolean {
	const [first, ...rest] = visibleGroups;
	if (!first) return false;
	if (rest.length > 0) return true;
	const only = first.name;
	return fields.some(
		(field) =>
			!fieldInGroup(field, only) &&
			!isHidden(field) &&
			isFieldVisible(field, documentData, documentData)
	);
}

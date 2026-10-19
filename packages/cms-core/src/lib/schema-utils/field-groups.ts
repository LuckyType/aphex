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

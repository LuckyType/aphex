import type { Field, FieldType } from '../types/schemas';

/**
 * Get the default value for a field type
 * @param fieldType - The field type
 * @returns The default value for the field type
 */
export function getDefaultValueForFieldType(fieldType: FieldType): any {
	switch (fieldType) {
		case 'view':
			// A display slot never holds a value.
			return undefined;
		case 'boolean':
			return false;
		case 'array':
			return [];
		case 'object':
			return {};
		case 'number':
			return null;
		default:
			// string, text, slug, url, image, date, datetime, reference
			return '';
	}
}

/**
 * A new item for an array of objects, defaulted the way `ArrayField` defaults
 * one: `_type` and a fresh `_key`, then every field's literal `initialValue`,
 * or the type's own empty value where the schema gives none (or gives a
 * function, which only a document-level editor can resolve). Exported so an
 * app's own array input creates items by the same rule.
 */
export function newArrayItem(
	schema: { fields?: readonly Field[] },
	typeName: string,
	generateKey: () => string
): Record<string, unknown> {
	const item: Record<string, unknown> = { _type: typeName, _key: generateKey() };
	for (const field of schema.fields ?? []) {
		if (field.type === 'view') continue;
		const initial = 'initialValue' in field ? field.initialValue : undefined;
		item[field.name] =
			initial !== undefined && typeof initial !== 'function'
				? initial
				: getDefaultValueForFieldType(field.type);
	}
	return item;
}

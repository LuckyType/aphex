import type { Field, SchemaType, TypeReference } from '../types/schemas';
import { isViewField } from './view-fields';

export interface StripUnknownFieldsOptions {
	/** Every registered schema, so an array item naming a type resolves to its fields. */
	schemas?: readonly SchemaType[];
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
	typeof v === 'object' && v !== null && !Array.isArray(v);

function itemFields(
	of: readonly TypeReference[],
	item: Record<string, unknown>,
	schemas: readonly SchemaType[] | undefined
): Field[] | undefined {
	const typeName = typeof item._type === 'string' ? item._type : undefined;
	const ref = typeName
		? (of.find((t) => t.name === typeName) ?? of.find((t) => t.type === typeName))
		: of.length === 1
			? of[0]
			: undefined;
	if (!ref || ref.type === 'block' || ref.type === 'reference') return undefined;
	if (ref.fields) return ref.fields;
	return schemas?.find((s) => s.name === ref.type)?.fields;
}

/**
 * `data` without the keys `fields` do not declare, at every depth the schema
 * describes. Keys starting with `_` (`_type`, `_key`, `_ref`) are structure
 * and stay; a value under a `view` field's name goes, since a view holds
 * none. Array items of a `block` or `reference` type, and items whose type
 * the schema cannot resolve, are kept as they are.
 *
 * This is what `unknownFields: 'strip'` runs before validation. It never
 * mutates its input.
 */
export function stripUnknownFields(
	fields: readonly Field[],
	data: Record<string, unknown>,
	options: StripUnknownFieldsOptions = {}
): Record<string, unknown> {
	const byName = new Map(fields.filter((f) => !isViewField(f)).map((f) => [f.name, f]));
	const out: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(data)) {
		if (key.startsWith('_')) {
			out[key] = value;
			continue;
		}
		const field = byName.get(key);
		if (!field) continue;
		out[key] = stripValue(field, value, options);
	}
	return out;
}

function stripValue(field: Field, value: unknown, options: StripUnknownFieldsOptions): unknown {
	if (field.type === 'object' && Array.isArray(field.fields) && isPlainObject(value)) {
		return stripUnknownFields(field.fields, value, options);
	}
	if (field.type === 'array' && Array.isArray(value) && field.of) {
		const of = field.of;
		return value.map((item) => {
			if (!isPlainObject(item)) return item;
			const fields = itemFields(of, item, options.schemas);
			return fields ? stripUnknownFields(fields, item, options) : item;
		});
	}
	return value;
}

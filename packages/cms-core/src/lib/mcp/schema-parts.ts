// `get_schema` in parts for a schema too large to answer whole.
//
// A page type whose block list nests inside container blocks several levels
// deep can serialise to megabytes, far past what an MCP client reads from one
// tool result (Claude Code: 25,000 tokens by default). Past `SCHEMA_INLINE_LIMIT`,
// `get_schema` answers with every inline object type of an array (a block)
// reduced to a stub, and `get_schema` with `type` answers one of them.

import type { Field, SchemaType, TypeReference } from '../types/schemas';

/** Characters of compact JSON above which a schema is answered in parts. */
export const SCHEMA_INLINE_LIMIT = 50_000;

type InlineObjectType = TypeReference & { name: string; fields: Field[] };

function isInlineObjectType(item: TypeReference): item is InlineObjectType {
	return typeof item.name === 'string' && Array.isArray(item.fields);
}

export function schemaIsTooLarge(schema: SchemaType): boolean {
	return JSON.stringify(schema).length > SCHEMA_INLINE_LIMIT;
}

/** A field with every array's inline object types reduced to a stub, at any depth. */
function stubField(field: Field): Field {
	if (field.type === 'array' && field.of) {
		return {
			...field,
			of: field.of.map((item) =>
				isInlineObjectType(item)
					? ({
							type: item.type,
							name: item.name,
							title: item.title,
							fieldsVia: `get_schema with type '${item.name}'`
						} as TypeReference)
					: item
			)
		};
	}
	if (field.type === 'object' && field.fields) {
		return { ...field, fields: field.fields.map(stubField) };
	}
	return field;
}

export function stubFields(fields: Field[]): Field[] {
	return fields.map(stubField);
}

/** The names of the inline object types a stubbed array holds, if it holds any. */
export function stubbedItemTypes(field: Field): string[] {
	if (field.type !== 'array' || !field.of) return [];
	return field.of.filter((item) => 'fieldsVia' in item).map((item) => item.name as string);
}

interface Occurrence {
	path: string;
	definition: InlineObjectType;
}

function collectOccurrences(fields: Field[], typeName: string, prefix: string, out: Occurrence[]) {
	for (const field of fields) {
		const path = prefix ? `${prefix}.${field.name}` : field.name;
		if (field.type === 'object' && field.fields) {
			collectOccurrences(field.fields, typeName, path, out);
		} else if (field.type === 'array' && field.of) {
			for (const item of field.of) {
				if (!isInlineObjectType(item)) continue;
				const itemPath = `${path}[${item.name}]`;
				if (item.name === typeName) out.push({ path: itemPath, definition: item });
				collectOccurrences(item.fields, typeName, itemPath, out);
			}
		}
	}
}

export interface ObjectTypePart {
	definition: InlineObjectType;
	foundAt: string[];
	/** Where the same type is stored with other fields, e.g. a block inside a container block. */
	variants: Array<{
		foundAt: string[];
		addsFields: Field[];
		changesFields: Field[];
		dropsFields: string[];
	}>;
}

/**
 * One inline object type of a schema, stubbed like the schema itself. Its
 * occurrences are grouped by definition; the first one met (the shallowest)
 * is answered whole and the others as their difference from it, so six
 * identical container levels cost one entry rather than six copies.
 */
export function objectTypePart(schema: SchemaType, typeName: string): ObjectTypePart | null {
	const occurrences: Occurrence[] = [];
	collectOccurrences(schema.fields, typeName, '', occurrences);
	if (occurrences.length === 0) return null;

	const groups = new Map<string, { definition: InlineObjectType; foundAt: string[] }>();
	for (const { path, definition } of occurrences) {
		const stubbed = { ...definition, fields: stubFields(definition.fields) };
		const key = JSON.stringify(stubbed);
		const group = groups.get(key);
		if (group) group.foundAt.push(path);
		else groups.set(key, { definition: stubbed, foundAt: [path] });
	}

	const [primary, ...others] = [...groups.values()];
	const primaryFields = new Map(primary!.definition.fields.map((f) => [f.name, JSON.stringify(f)]));
	return {
		definition: primary!.definition,
		foundAt: primary!.foundAt,
		variants: others.map(({ definition, foundAt }) => {
			const names = new Set(definition.fields.map((f) => f.name));
			return {
				foundAt,
				addsFields: definition.fields.filter((f) => !primaryFields.has(f.name)),
				changesFields: definition.fields.filter(
					(f) => primaryFields.has(f.name) && primaryFields.get(f.name) !== JSON.stringify(f)
				),
				dropsFields: [...primaryFields.keys()].filter((name) => !names.has(name))
			};
		})
	};
}

/** Every inline object type a schema holds in an array, by name, at any depth. */
export function objectTypeNames(schema: SchemaType): string[] {
	const names = new Set<string>();
	const walk = (fields: Field[]) => {
		for (const field of fields) {
			if (field.type === 'object' && field.fields) walk(field.fields);
			else if (field.type === 'array' && field.of) {
				for (const item of field.of) {
					if (!isInlineObjectType(item)) continue;
					if (!names.has(item.name)) {
						names.add(item.name);
						walk(item.fields);
					}
				}
			}
		}
	};
	walk(schema.fields);
	return [...names];
}

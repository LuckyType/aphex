// `get_schema` in parts for a schema too large to answer whole.
//
// A page type whose block list nests inside container blocks several levels
// deep can serialise to megabytes, far past what an MCP client reads from one
// tool result (Claude Code: 25,000 tokens by default). Past `SCHEMA_INLINE_LIMIT`,
// `get_schema` answers with every inline object type of an array (a block)
// reduced to a stub, and `get_schema` with `type` answers one of them.
//
// An array item may also name a registered object type instead of inlining
// its fields (a container block that holds itself). Such a type is resolved
// through the registry and answered the same way: a stub where it is named,
// its fields through `type`. A schema naming one is always answered in parts,
// since a type that holds itself has no whole form to inline.

import type { Field, SchemaType, TypeReference } from '../types/schemas';

/** Characters of compact JSON above which a schema is answered in parts. */
export const SCHEMA_INLINE_LIMIT = 50_000;

type InlineObjectType = TypeReference & { name: string; fields: Field[] };

function isInlineObjectType(item: TypeReference): item is InlineObjectType {
	return typeof item.name === 'string' && Array.isArray(item.fields);
}

/** The registered schemas, so an array item naming an object type resolves to its fields. */
export type NamedTypes = readonly SchemaType[];

/** `item` as an object type with fields: inline, or the registered object type it names. */
function objectTypeOf(item: TypeReference, named: NamedTypes): InlineObjectType | null {
	if (isInlineObjectType(item)) return item;
	const schema = named.find(
		(candidate) => candidate.type === 'object' && candidate.name === item.type
	);
	if (!schema) return null;
	return {
		...item,
		name: item.name ?? schema.name,
		title: item.title ?? schema.title,
		fields: schema.fields
	};
}

export function schemaIsTooLarge(schema: SchemaType): boolean {
	return JSON.stringify(schema).length > SCHEMA_INLINE_LIMIT;
}

/** Whether an array anywhere in `fields` names a registered object type instead of inlining it. */
function namesObjectType(fields: Field[], named: NamedTypes): boolean {
	return fields.some((field) => {
		if (field.type === 'object' && field.fields) return namesObjectType(field.fields, named);
		if (field.type !== 'array' || !field.of) return false;
		return field.of.some((item) =>
			isInlineObjectType(item)
				? namesObjectType(item.fields, named)
				: objectTypeOf(item, named) !== null
		);
	});
}

/** Whether `get_schema` answers `schema` in parts: too large, or naming a registered object type. */
export function answersInParts(schema: SchemaType, named: NamedTypes = []): boolean {
	return schemaIsTooLarge(schema) || namesObjectType(schema.fields, named);
}

/** A field with every array's object types reduced to a stub, at any depth. */
function stubField(field: Field, named: NamedTypes): Field {
	if (field.type === 'array' && field.of) {
		return {
			...field,
			of: field.of.map((item) => {
				const objectType = objectTypeOf(item, named);
				return objectType
					? ({
							type: item.type,
							name: objectType.name,
							title: objectType.title,
							fieldsVia: `get_schema with type '${objectType.name}'`
						} as TypeReference)
					: item;
			})
		};
	}
	if (field.type === 'object' && field.fields) {
		return { ...field, fields: field.fields.map((nested) => stubField(nested, named)) };
	}
	return field;
}

export function stubFields(fields: Field[], named: NamedTypes = []): Field[] {
	return fields.map((field) => stubField(field, named));
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

/**
 * Every place `typeName` is stored under `fields`. A named type is entered
 * once (`entered`): it holds the same fields wherever it is named, and a type
 * that holds itself would otherwise never end.
 */
function collectOccurrences(
	fields: Field[],
	typeName: string,
	prefix: string,
	out: Occurrence[],
	named: NamedTypes,
	entered: Set<string>
) {
	for (const field of fields) {
		const path = prefix ? `${prefix}.${field.name}` : field.name;
		if (field.type === 'object' && field.fields) {
			collectOccurrences(field.fields, typeName, path, out, named, entered);
		} else if (field.type === 'array' && field.of) {
			for (const item of field.of) {
				const objectType = objectTypeOf(item, named);
				if (!objectType) continue;
				const itemPath = `${path}[${objectType.name}]`;
				if (objectType.name === typeName) out.push({ path: itemPath, definition: objectType });
				if (!isInlineObjectType(item)) {
					if (entered.has(objectType.name)) continue;
					entered.add(objectType.name);
				}
				collectOccurrences(objectType.fields, typeName, itemPath, out, named, entered);
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
export function objectTypePart(
	schema: SchemaType,
	typeName: string,
	named: NamedTypes = []
): ObjectTypePart | null {
	const occurrences: Occurrence[] = [];
	collectOccurrences(schema.fields, typeName, '', occurrences, named, new Set());
	if (occurrences.length === 0) return null;

	const groups = new Map<string, { definition: InlineObjectType; foundAt: string[] }>();
	for (const { path, definition } of occurrences) {
		const stubbed = { ...definition, fields: stubFields(definition.fields, named) };
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

/** Every object type a schema holds in an array, inline or named, by name, at any depth. */
export function objectTypeNames(schema: SchemaType, named: NamedTypes = []): string[] {
	const names = new Set<string>();
	const walk = (fields: Field[]) => {
		for (const field of fields) {
			if (field.type === 'object' && field.fields) walk(field.fields);
			else if (field.type === 'array' && field.of) {
				for (const item of field.of) {
					const objectType = objectTypeOf(item, named);
					if (!objectType) continue;
					if (!names.has(objectType.name)) {
						names.add(objectType.name);
						walk(objectType.fields);
					}
				}
			}
		}
	};
	walk(schema.fields);
	return [...names];
}

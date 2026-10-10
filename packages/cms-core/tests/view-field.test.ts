/**
 * A `view` field is a display slot: drawn by an `aphex/field/view` part,
 * never stored. The validator refuses a value under its name, and the type
 * generator, the GraphQL and OpenAPI schemas and the item defaults skip it.
 *
 * Lives in tests/ (not src/) so the package build never compiles it into dist.
 * Run: pnpm -F @aphexcms/cms-core test
 */
import { describe, expect, it } from 'vitest';
import { validateDocumentData } from '../src/lib/field-validation/utils';
import { validateSchemaReferences } from '../src/lib/schema-utils/validator';
import { isViewField, storedFields } from '../src/lib/schema-utils/view-fields';
import { generateTypes } from '../src/lib/type-gen';
import { generateGraphQLSchema } from '../src/lib/graphql/schema';
import { fieldsToJsonSchema } from '../src/lib/server/api/openapi/json-schema';
import { getDefaultValueForFieldType, newArrayItem } from '../src/lib/utils/field-defaults';
import { createPartResolver } from '../src/lib/plugins/resolver';
import type { SchemaType } from '../src/lib/types/schemas';

const contact: SchemaType = {
	type: 'document',
	name: 'contact',
	title: 'Contact',
	fields: [
		{ name: 'street', type: 'string', title: 'Street' },
		{
			name: 'appearsOn',
			type: 'view',
			title: 'Where it appears',
			input: 'usage',
			validation: (Rule) => Rule.required()
		}
	]
};

describe('view field', () => {
	it('is told apart from stored fields', () => {
		expect(contact.fields.map(isViewField)).toEqual([false, true]);
		expect(storedFields(contact.fields).map((f) => f.name)).toEqual(['street']);
	});

	it('validates clean without a value and ignores its own rules', async () => {
		const result = await validateDocumentData(contact, { street: 'Main' });
		expect(result.errors).toEqual([]);
	});

	it('refuses a value sent under its name as structural', async () => {
		const result = await validateDocumentData(contact, { street: 'Main', appearsOn: 'x' });
		expect(result.structuralErrors.map((e) => [e.field, e.errors[0]])).toEqual([
			['appearsOn', 'is a view field and holds no value']
		]);
	});

	it('must name the part that draws it', () => {
		expect(() =>
			validateSchemaReferences([
				{ ...contact, fields: [{ name: 'slot', type: 'view', title: 'Slot' } as never] }
			])
		).toThrow(/view field "slot" must name the "aphex\/field\/view" part/);
		expect(() => validateSchemaReferences([contact])).not.toThrow();
	});

	it('is left out of the generated types, GraphQL and OpenAPI schemas', () => {
		expect(generateTypes([contact])).not.toContain('appearsOn');
		expect(generateGraphQLSchema([contact])).not.toContain('appearsOn');
		const json = fieldsToJsonSchema(contact.fields, new Map([[contact.name, contact]]));
		expect(Object.keys(json.properties ?? {})).toEqual(['street']);
	});

	it('gets no default and no key in a new array item', () => {
		expect(getDefaultValueForFieldType('view')).toBeUndefined();
		const item = newArrayItem(contact, 'contact', () => 'k1');
		expect(Object.keys(item)).toEqual(['_type', '_key', 'street']);
	});

	it('resolves through the aphex/field/view part', () => {
		const component = (() => null) as never;
		const resolver = createPartResolver([
			{ name: 'usage', parts: [{ implements: 'aphex/field/view', input: 'usage', component }] }
		]);
		expect(resolver.fieldView('usage')?.component).toBe(component);
		expect(resolver.fieldView('other')).toBeUndefined();
		expect(resolver.fieldComponent('usage')).toBeUndefined();
	});
});

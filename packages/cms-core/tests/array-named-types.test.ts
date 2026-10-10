/**
 * `validateArrayItems` resolves an `of` entry that names a registered object
 * type through `context.schemas`, so a type can hold an array of itself, and
 * refuses an item nested deeper than the array's `maxDepth`.
 *
 * Lives in tests/ (not src/) so the package build never compiles it into dist.
 * Run: pnpm -F @aphexcms/cms-core test
 */
import { describe, expect, it } from 'vitest';
import { DEFAULT_MAX_NESTING_DEPTH, validateDocumentData } from '../src/lib/field-validation/utils';
import type { SchemaType } from '../src/lib/types/schemas';

const container: SchemaType = {
	type: 'object',
	name: 'container',
	title: 'Container',
	fields: [
		{ name: 'label', type: 'string', title: 'Label', validation: (Rule) => Rule.required() },
		{ name: 'children', type: 'array', title: 'Children', of: [{ type: 'container' }], maxDepth: 3 }
	]
};

const page: SchemaType = {
	type: 'document',
	name: 'page',
	title: 'Page',
	fields: [{ name: 'layout', type: 'array', title: 'Layout', of: [{ type: 'container' }] }]
};

const schemas = [page, container];

function nested(levels: number): Record<string, unknown> {
	const item: Record<string, unknown> = { _type: 'container', _key: `k${levels}`, label: 'L' };
	return levels <= 1 ? item : { ...item, children: [nested(levels - 1)] };
}

describe('array items naming a registered type', () => {
	it('validates the named type against its fields', async () => {
		const result = await validateDocumentData(
			page,
			{
				layout: [{ _type: 'container', _key: 'a', children: [{ _type: 'container', _key: 'b' }] }]
			},
			{ schemas }
		);
		expect(result.isValid).toBe(false);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0]!.field).toBe('layout');
		expect(result.errors[0]!.errors.join('; ')).toContain('Field "layout[0].label" Required');
		expect(result.errors[0]!.errors.join('; ')).toContain(
			'Field "layout[0].children[0].label" Required'
		);
	});

	it('leaves the item alone without a registry, as before', async () => {
		const result = await validateDocumentData(page, {
			layout: [{ _type: 'container', _key: 'a', bogus: true }]
		});
		expect(result.isValid).toBe(true);
	});

	it('accepts nesting up to maxDepth and refuses the level below it', async () => {
		const ok = await validateDocumentData(page, { layout: [nested(3)] }, { schemas });
		expect(ok.isValid).toBe(true);

		const deep = await validateDocumentData(page, { layout: [nested(4)] }, { schemas });
		expect(deep.isValid).toBe(false);
		expect(deep.structuralErrors).toEqual([
			{
				field: 'layout',
				errors: [
					'Field "layout[0].children[0].children[0].children[0]" nests deeper than the allowed depth of 3'
				],
				kind: 'structural'
			}
		]);
	});

	it('bounds an undeclared array by the default depth', async () => {
		const loose: SchemaType = {
			...container,
			fields: [
				container.fields[0]!,
				{ name: 'children', type: 'array', title: 'Children', of: [{ type: 'container' }] }
			]
		};
		const registry = [page, loose];
		const ok = await validateDocumentData(
			page,
			{ layout: [nested(DEFAULT_MAX_NESTING_DEPTH)] },
			{ schemas: registry }
		);
		expect(ok.isValid).toBe(true);
		const deep = await validateDocumentData(
			page,
			{ layout: [nested(DEFAULT_MAX_NESTING_DEPTH + 1)] },
			{ schemas: registry }
		);
		expect(deep.structuralErrors).toHaveLength(1);
		expect(deep.structuralErrors[0]!.errors[0]).toContain(`depth of ${DEFAULT_MAX_NESTING_DEPTH}`);
	});
});

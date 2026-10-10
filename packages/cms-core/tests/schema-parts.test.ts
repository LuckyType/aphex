import { describe, expect, it } from 'vitest';
import {
	answersInParts,
	objectTypeNames,
	objectTypePart,
	schemaIsTooLarge,
	stubFields,
	stubbedItemTypes
} from '../src/lib/mcp/schema-parts';
import type { Field, SchemaType } from '../src/lib/types/schemas';

const heading = { type: 'object', name: 'heading', fields: [{ name: 'text', type: 'string' }] };
const container = (depth: number): Record<string, unknown> => ({
	type: 'object',
	name: 'container',
	fields: [
		{ name: 'layout', type: 'string' },
		...(depth > 0 ? [{ name: 'children', type: 'array', of: [heading, container(depth - 1)] }] : [])
	]
});
const page = {
	type: 'document',
	name: 'page',
	title: 'Page',
	fields: [
		{ name: 'title', type: 'string' },
		{ name: 'blocks', type: 'array', of: [heading, container(3)] }
	]
} as unknown as SchemaType;

describe('schema parts', () => {
	it('stubs every inline array item type and names it', () => {
		const fields = stubFields(page.fields);
		const blocks = fields.find((f) => f.name === 'blocks') as Field;
		expect(stubbedItemTypes(blocks)).toEqual(['heading', 'container']);
		expect(JSON.stringify(fields)).not.toContain('"layout"');
	});

	it('lists the item types at any depth once', () => {
		expect(objectTypeNames(page)).toEqual(['heading', 'container']);
	});

	it('answers one type, with deeper copies as differences', () => {
		const part = objectTypePart(page, 'container');
		expect(part?.foundAt[0]).toBe('blocks[container]');
		expect(part?.definition.fields.map((f) => f.name)).toEqual(['layout', 'children']);
		const innermost = part?.variants.find((v) => v.dropsFields.includes('children'));
		expect(innermost).toBeDefined();
		expect(objectTypePart(page, 'missing')).toBeNull();
	});

	it('only answers in parts past the inline limit', () => {
		expect(schemaIsTooLarge(page)).toBe(false);
		const huge = { ...page, description: 'x'.repeat(60_000) };
		expect(schemaIsTooLarge(huge)).toBe(true);
	});

	describe('an array item naming a registered object type', () => {
		// A container that holds itself by name, as a validator with a registry allows.
		const box = {
			type: 'object',
			name: 'box',
			title: 'Box',
			fields: [
				{ name: 'layout', type: 'string' },
				{ name: 'children', type: 'array', of: [heading, { type: 'box' }], maxDepth: 4 }
			]
		} as unknown as SchemaType;
		const boxPage = {
			type: 'document',
			name: 'boxPage',
			fields: [{ name: 'blocks', type: 'array', of: [heading, { type: 'box' }] }]
		} as unknown as SchemaType;
		const named = [boxPage, box];

		it('is answered in parts, though small, and only with the registry to resolve it', () => {
			expect(schemaIsTooLarge(boxPage)).toBe(false);
			expect(answersInParts(boxPage, named)).toBe(true);
			expect(answersInParts(boxPage)).toBe(false);
			expect(answersInParts(page, named)).toBe(false);
		});

		it('is stubbed and listed like an inline type', () => {
			const blocks = stubFields(boxPage.fields, named)[0] as Field;
			expect(stubbedItemTypes(blocks)).toEqual(['heading', 'box']);
			expect(objectTypeNames(boxPage, named)).toEqual(['heading', 'box']);
		});

		it('answers its fields once, though it holds itself', () => {
			const part = objectTypePart(boxPage, 'box', named);
			expect(part?.definition.fields.map((f) => f.name)).toEqual(['layout', 'children']);
			expect(part?.foundAt).toEqual(['blocks[box]', 'blocks[box].children[box]']);
			expect(part?.variants).toEqual([]);
			const inner = part?.definition.fields.find((f) => f.name === 'children') as Field;
			expect(stubbedItemTypes(inner)).toEqual(['heading', 'box']);
			expect(objectTypePart(boxPage, 'heading', named)?.foundAt).toEqual([
				'blocks[heading]',
				'blocks[box].children[heading]'
			]);
		});
	});
});

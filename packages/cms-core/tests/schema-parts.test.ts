import { describe, expect, it } from 'vitest';
import {
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
});

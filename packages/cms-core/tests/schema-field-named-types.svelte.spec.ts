// @vitest-environment jsdom
/**
 * A field's own validation in the editor resolves array items naming a
 * registered object type through the schema registry, as the publish check
 * does, so a broken nested item shows under its field before publish.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

// The client bundle loads @dnd-kit, which builds a ResizeObserver at import
// time; jsdom has none.
vi.hoisted(() => {
	globalThis.ResizeObserver ??= class {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof ResizeObserver;
});

const registry = vi.hoisted(() => ({ schemas: [] as unknown[] }));
vi.mock('../src/lib/schema-context.svelte', () => ({
	getSchemaContext: () => registry.schemas
}));

import SchemaField from '../src/lib/components/admin/SchemaField.svelte';

afterEach(() => cleanup());

const node = {
	type: 'object',
	name: 'node',
	title: 'Node',
	fields: [
		{
			name: 'label',
			type: 'string',
			title: 'Label',
			validation: (Rule: { required: () => unknown }) => Rule.required()
		},
		{ name: 'children', type: 'array', title: 'Children', of: [{ type: 'node' }], maxDepth: 2 }
	]
};

const items = { name: 'items', type: 'array', title: 'Items', of: [{ type: 'node' }] };

async function validate(value: unknown[]) {
	const { component } = render(SchemaField, {
		props: { field: items as never, value, documentData: { items: value }, onUpdate: () => {} }
	});
	await (
		component as unknown as { performValidation: (v: unknown) => Promise<void> }
	).performValidation(value);
}

describe('SchemaField with named array item types', () => {
	it('reports a broken nested item through the registry', async () => {
		registry.schemas = [node];
		await validate([
			{ _type: 'node', _key: 'a', label: 'A', children: [{ _type: 'node', _key: 'b' }] }
		]);
		expect(await screen.findByRole('alert')).toHaveTextContent('items[0].children[0].label');
	});

	it('reports an item deeper than the array allows', async () => {
		registry.schemas = [node];
		const deepest = { _type: 'node', _key: 'c', label: 'C' };
		const middle = { _type: 'node', _key: 'b', label: 'B', children: [deepest] };
		await validate([{ _type: 'node', _key: 'a', label: 'A', children: [middle] }]);
		expect(await screen.findByRole('alert')).toHaveTextContent('nests deeper');
	});

	it('leaves named items unchecked without a registry', async () => {
		registry.schemas = [];
		await validate([{ _type: 'node', _key: 'a', children: [{ _type: 'node', _key: 'b' }] }]);
		expect(screen.queryByRole('alert')).toBeNull();
	});
});

// @vitest-environment jsdom
/**
 * A widget fills several neighbours with one change through `onUpdateSiblings`,
 * at the top level and inside an inline object, as a view slot and as a custom input.
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
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

vi.mock('../src/lib/schema-context.svelte', () => ({ getSchemaContext: () => [] }));

import SchemaField from '../src/lib/components/admin/SchemaField.svelte';
import FillNeighbours from './fixtures/FillNeighbours.svelte';

afterEach(() => cleanup());

const context = new Map<symbol, unknown>([
	[Symbol.for('aphex.admin.field-views'), () => FillNeighbours],
	[Symbol.for('aphex.admin.field-components'), () => FillNeighbours]
]);

describe('onUpdateSiblings', () => {
	it('hands a top-level view slot the host callback', async () => {
		const onUpdateSiblings = vi.fn();
		render(SchemaField, {
			context,
			props: {
				field: { name: 'search', type: 'view', title: 'Search', input: 'fill' } as never,
				value: undefined,
				documentData: { street: '' },
				onUpdate: () => {},
				onUpdateSiblings
			}
		});
		await fireEvent.click(screen.getByRole('button', { name: 'Fill' }));
		expect(onUpdateSiblings).toHaveBeenCalledWith({ street: 'Hauptstr. 1', city: 'Berlin' });
	});

	it('merges the patch into an inline object as one update, keeping its other fields', async () => {
		const onUpdate = vi.fn();
		render(SchemaField, {
			context,
			props: {
				field: {
					name: 'address',
					type: 'object',
					title: 'Address',
					fields: [
						{ name: 'search', type: 'string', title: 'Search', input: 'fill' },
						{ name: 'street', type: 'string', title: 'Street' },
						{ name: 'city', type: 'string', title: 'City' }
					]
				} as never,
				value: { street: 'Old', city: 'Old', note: 'kept' },
				documentData: {},
				onUpdate
			}
		});
		await fireEvent.click(screen.getByRole('button', { name: 'Fill' }));
		expect(onUpdate).toHaveBeenCalledTimes(1);
		expect(onUpdate).toHaveBeenCalledWith({ street: 'Hauptstr. 1', city: 'Berlin', note: 'kept' });
	});
});

// @vitest-environment jsdom
/**
 * A reference field's `order` decides the order its picker offers documents
 * in, before and while something is typed.
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
	globalThis.ResizeObserver ??= class {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof ResizeObserver;
	Element.prototype.scrollIntoView ??= () => {};
});

const pageSchema = {
	type: 'document',
	name: 'page',
	title: 'Page',
	fields: [{ name: 'title', type: 'string', title: 'Title' }]
};

vi.mock('../src/lib/schema-context.svelte', () => ({ getSchemaContext: () => [pageSchema] }));
vi.mock('../src/lib/api/documents', () => ({
	documents: {
		list: async () => ({
			success: true,
			data: ['Home', 'About', 'Contact'].map((title, index) => ({
				id: `p${index}`,
				type: 'page',
				title,
				_meta: { type: 'page', status: 'published' }
			}))
		}),
		getById: async () => ({ success: false })
	}
}));

import ReferenceField from '../src/lib/components/admin/fields/ReferenceField.svelte';

afterEach(() => cleanup());

function offered(): string[] {
	return [...document.querySelectorAll('[data-command-item] .truncate.text-sm')].map(
		(el) => el.textContent ?? ''
	);
}

describe('ReferenceField order', () => {
	it('lists the documents in the order the field gives', async () => {
		const field = {
			name: 'page',
			type: 'reference',
			title: 'Page',
			to: [{ type: 'page' }],
			order: <Doc extends { id: string }>(docs: readonly Doc[]) => [...docs].reverse()
		};
		render(ReferenceField, { props: { field: field as never, value: null, onUpdate: () => {} } });
		const input = screen.getByPlaceholderText('Type to search...');
		await fireEvent.focus(input);
		await vi.waitFor(() => expect(offered()).toEqual(['Contact', 'About', 'Home']));

		await fireEvent.input(input, { target: { value: 'o' } });
		await vi.waitFor(() => expect(offered()).toEqual(['Contact', 'About', 'Home']));
	});

	it('keeps the listed order without one', async () => {
		const field = { name: 'page', type: 'reference', title: 'Page', to: [{ type: 'page' }] };
		render(ReferenceField, { props: { field: field as never, value: null, onUpdate: () => {} } });
		await fireEvent.focus(screen.getByPlaceholderText('Type to search...'));
		await vi.waitFor(() => expect(offered()).toEqual(['Home', 'About', 'Contact']));
	});
});

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

describe('ReferenceField Escape', () => {
	it('closes the results and keeps the Escape from the panel around it', async () => {
		const field = { name: 'page', type: 'reference', title: 'Page', to: [{ type: 'page' }] };
		render(ReferenceField, { props: { field: field as never, value: null, onUpdate: () => {} } });
		const input = screen.getByPlaceholderText('Type to search...');
		await fireEvent.focus(input);
		await vi.waitFor(() => expect(offered()).toHaveLength(3));

		const first = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
		input.dispatchEvent(first);
		expect(first.defaultPrevented).toBe(true);
		await vi.waitFor(() => expect(offered()).toEqual([]));

		const second = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
		input.dispatchEvent(second);
		expect(second.defaultPrevented).toBe(false);
	});
});

describe('ReferenceField keyboard', () => {
	const field = { name: 'page', type: 'reference', title: 'Page', to: [{ type: 'page' }] };

	function key(input: HTMLElement, name: string) {
		const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true });
		input.dispatchEvent(event);
		return event;
	}

	it('picks the first match with Enter after typing', async () => {
		const onUpdate = vi.fn();
		render(ReferenceField, { props: { id: 'page', field: field as never, value: null, onUpdate } });
		const input = screen.getByRole('combobox');
		await fireEvent.focus(input);
		await fireEvent.input(input, { target: { value: 'Cont' } });
		await vi.waitFor(() => expect(offered()).toEqual(['Contact']));

		expect(key(input, 'Enter').defaultPrevented).toBe(true);
		expect(onUpdate).toHaveBeenCalledWith({ _type: 'reference', _ref: 'p2' });
	});

	it('walks the results with the arrow keys and names the highlighted one', async () => {
		const onUpdate = vi.fn();
		render(ReferenceField, { props: { id: 'page', field: field as never, value: null, onUpdate } });
		const input = screen.getByRole('combobox');
		await fireEvent.focus(input);
		expect(input.getAttribute('aria-expanded')).toBe('true');
		const highlighted = () =>
			document.getElementById(input.getAttribute('aria-activedescendant') ?? '')?.textContent;
		await vi.waitFor(() => expect(highlighted()).toContain('Home'));
		// Command.Root highlights its first item a couple of ticks after the items mount.
		await new Promise((resolve) => setTimeout(resolve, 20));

		key(input, 'ArrowDown');
		await vi.waitFor(() => expect(highlighted()).toContain('About'));
		key(input, 'ArrowUp');
		key(input, 'ArrowUp');
		await vi.waitFor(() => expect(highlighted()).toContain('Contact'));
		expect(screen.getByRole('option', { selected: true }).textContent).toContain('Contact');
		key(input, 'Enter');
		expect(onUpdate).toHaveBeenCalledWith({ _type: 'reference', _ref: 'p2' });
	});

	it('is a combobox named by its label, with a named list', async () => {
		render(ReferenceField, { props: { field: field as never, value: null, onUpdate: () => {} } });
		const input = screen.getByRole('combobox', { name: 'Page' });
		expect(input.getAttribute('aria-expanded')).toBe('false');
		await fireEvent.focus(input);
		await vi.waitFor(() => expect(screen.getByRole('listbox', { name: 'Results' })).toBeTruthy());
		expect(input.getAttribute('aria-controls')).toBe(screen.getByRole('listbox').id);
	});
});

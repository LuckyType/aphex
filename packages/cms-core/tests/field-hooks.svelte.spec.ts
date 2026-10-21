// @vitest-environment jsdom
/**
 * The app-wide field hooks: no title as placeholder, one rule for where
 * descriptions show, a default input per field, and a widget or view that
 * opens another document the way a reference does.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
	globalThis.ResizeObserver ??= class {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof ResizeObserver;
});

vi.mock('../src/lib/schema-context.svelte', () => ({ getSchemaContext: () => [] }));

import SchemaField from '../src/lib/components/admin/SchemaField.svelte';
import { configureStudio } from '../src/lib/studio-extensions';
import OpenDocument from './fixtures/OpenDocument.svelte';

afterEach(() => {
	cleanup();
	configureStudio({});
});

const widgets = new Map<symbol, unknown>([
	[
		Symbol.for('aphex.admin.field-views'),
		(input: string) => (input === 'open' ? OpenDocument : undefined)
	],
	[
		Symbol.for('aphex.admin.field-components'),
		(input: string) => (input === 'open' ? OpenDocument : undefined)
	]
]);

function field(props: Record<string, unknown>) {
	return render(SchemaField, {
		context: widgets,
		props: { value: undefined, documentData: {}, onUpdate: () => {}, ...props } as never
	});
}

describe('placeholders', () => {
	it('never repeat the title in a text input, a text area or a number', () => {
		field({ field: { name: 'quote', type: 'string', title: 'Quote' } });
		field({ field: { name: 'intro', type: 'text', title: 'Intro' } });
		field({ field: { name: 'count', type: 'number', title: 'Count', description: 'How many.' } });
		for (const input of [...screen.getAllByRole('textbox'), screen.getByRole('spinbutton')]) {
			expect(input).not.toHaveAttribute('placeholder');
		}
	});

	it("show the schema's own example", () => {
		field({ field: { name: 'role', type: 'string', title: 'Role', placeholder: 'e.g. Owner' } });
		expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', 'e.g. Owner');
	});
});

describe('fieldDescription', () => {
	const described = {
		name: 'quote',
		type: 'string',
		title: 'Quote',
		description: 'Without quotation marks.'
	};

	it('decides for a nested field what its object asked for', () => {
		configureStudio({ fieldDescription: () => 'inline' });
		field({ field: { name: 'block', type: 'object', title: 'Block', fields: [described] } });
		expect(screen.queryByRole('button', { name: /More info/ })).toBeNull();
		expect(screen.getByText('Without quotation marks.')).not.toHaveClass('lg:hidden');
	});

	it('can move a long description behind the icon at the top level', () => {
		configureStudio({
			fieldDescription: (f) => ((f.description?.length ?? 0) > 10 ? 'tooltip' : 'inline')
		});
		field({ field: described });
		expect(screen.getByRole('button', { name: 'More info about Quote' })).toBeInTheDocument();
	});
});

describe('defaultInput', () => {
	it('draws a field without its own input with the app widget', async () => {
		configureStudio({ defaultInput: (f) => (f.type === 'boolean' ? 'open' : undefined) });
		const onOpenReference = vi.fn();
		field({ field: { name: 'on', type: 'boolean', title: 'On' }, onOpenReference });
		expect(screen.queryByRole('checkbox')).toBeNull();
		await fireEvent.click(screen.getByRole('button', { name: 'Open' }));
		expect(onOpenReference).toHaveBeenCalledWith('hours-1', 'openingHours');
	});

	it("keeps a field's own input and the built-in for an unknown key", () => {
		configureStudio({ defaultInput: () => 'missing' });
		field({ field: { name: 'on', type: 'boolean', title: 'On' } });
		expect(screen.getByRole('checkbox')).toBeInTheDocument();
	});
});

describe('onOpenDocument', () => {
	it('reaches a view slot', async () => {
		const onOpenReference = vi.fn();
		field({
			field: { name: 'where', type: 'view', title: 'Where', input: 'open' },
			onOpenReference
		});
		await fireEvent.click(screen.getByRole('button', { name: 'Open' }));
		expect(onOpenReference).toHaveBeenCalledWith('hours-1', 'openingHours');
	});
});

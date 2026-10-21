// @vitest-environment jsdom
/**
 * Date fields show and take the Studio language's format while storing ISO,
 * their calendar opens on the field's month, and the object modal is a dialog
 * a screen reader can find by its title, with a named close button.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, expect, it, vi } from 'vitest';

vi.hoisted(() => {
	globalThis.ResizeObserver ??= class {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof ResizeObserver;
	window.matchMedia ??= ((query: string) => ({
		matches: false,
		media: query,
		addEventListener() {},
		removeEventListener() {},
		addListener() {},
		removeListener() {},
		dispatchEvent: () => false,
		onchange: null
	})) as unknown as typeof window.matchMedia;
});

vi.mock('../src/lib/api/documents', () => ({
	documents: new Proxy({}, { get: () => async () => ({ success: false, data: null }) })
}));
vi.mock('../src/lib/schema-context.svelte', () => ({ getSchemaContext: () => [] }));

import DateField from '../src/lib/components/admin/fields/DateField.svelte';
import DateTimeField from '../src/lib/components/admin/fields/DateTimeField.svelte';
import ObjectModal from '../src/lib/components/admin/ObjectModal.svelte';
import SchemaField from '../src/lib/components/admin/SchemaField.svelte';
import { configureStudioI18n } from '../src/lib/i18n/index';

const GERMAN = {
	locale: 'de-DE',
	messages: {
		Close: 'Schliessen',
		'Edit {title}': '{title} bearbeiten',
		'date format|DD': 'TT',
		'date format|YYYY': 'JJJJ',
		'date format|mm': 'MM'
	}
};

afterEach(async () => {
	cleanup();
	configureStudioI18n({});
	await new Promise((resolve) => setTimeout(resolve, 50));
});

it('shows a stored day in German and takes a German entry as ISO', async () => {
	configureStudioI18n(GERMAN);
	const onUpdate = vi.fn();
	render(DateField, {
		props: { field: { name: 'day', type: 'date' } as never, value: '2026-10-11', onUpdate }
	});
	const input = screen.getByRole('textbox') as HTMLInputElement;
	expect(input.value).toBe('11.10.2026');
	expect(input.placeholder).toBe('TT.MM.JJJJ');
	await fireEvent.input(input, { target: { value: '24.12.26' } });
	expect(onUpdate).toHaveBeenLastCalledWith('2026-12-24');
});

it('takes a German date with an hour alone, stored as ISO UTC of that local time', async () => {
	configureStudioI18n(GERMAN);
	const onUpdate = vi.fn();
	render(DateTimeField, {
		props: { field: { name: 'at', type: 'datetime' } as never, value: null, onUpdate }
	});
	const input = screen.getByRole('textbox') as HTMLInputElement;
	expect(input.placeholder).toBe('TT.MM.JJJJ HH:MM');
	await fireEvent.input(input, { target: { value: '24.12.2026 18' } });
	expect(onUpdate).toHaveBeenLastCalledWith(
		new Date(2026, 11, 24, 18, 0).toISOString().replace('.000', '')
	);
});

it('keeps a half-typed entry rather than reading it as a date', async () => {
	configureStudioI18n(GERMAN);
	const onUpdate = vi.fn();
	const { rerender } = render(DateTimeField, {
		props: { field: { name: 'at', type: 'datetime' } as never, value: null, onUpdate }
	});
	const input = screen.getByRole('textbox') as HTMLInputElement;
	await fireEvent.input(input, { target: { value: '2' } });
	expect(onUpdate).toHaveBeenLastCalledWith('2');
	await rerender({ value: '2' });
	expect(input.value).toBe('2');
});

it('names the format it expects when an entry is no date', async () => {
	configureStudioI18n(GERMAN);
	render(SchemaField, {
		props: {
			field: { name: 'day', type: 'date', title: 'Day' } as never,
			value: '24/12/2026',
			documentData: {},
			onUpdate: () => {}
		}
	});
	const input = screen.getByRole('textbox');
	input.focus();
	await fireEvent.focusOut(input, { relatedTarget: document.body });
	expect(await screen.findByRole('alert')).toHaveTextContent('Expected: TT.MM.JJJJ');
});

it('opens the calendar on the month of the field', async () => {
	configureStudioI18n(GERMAN);
	render(DateField, {
		props: {
			field: { name: 'day', type: 'date' } as never,
			value: '2026-12-24',
			onUpdate: () => {}
		}
	});
	await fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
	await screen.findByRole('grid');
	expect(document.querySelector('[data-value="2026-12-24"]')).not.toBeNull();
	expect(document.querySelector('[data-value="2026-12-01"]')).not.toBeNull();
});

it('is a dialog named by its title with a named close button and no backdrop button', async () => {
	configureStudioI18n(GERMAN);
	const onClose = vi.fn();
	render(ObjectModal, {
		props: {
			open: true,
			schema: {
				type: 'object',
				name: 'row',
				title: 'Row',
				fields: [{ name: 'label', type: 'string', title: 'Label' }]
			} as never,
			value: {},
			onClose,
			onUpdate: () => {}
		}
	});
	const dialog = screen.getByRole('dialog', { name: 'Row bearbeiten' });
	expect(dialog).toHaveAttribute('aria-modal', 'true');
	expect(screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'))).toEqual([
		'Schliessen'
	]);
	await fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });
	expect(onClose).toHaveBeenCalledTimes(1);
});

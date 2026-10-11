// @vitest-environment jsdom
/**
 * dnd-kit reads the Accessibility plugin's texts once, as its manager is
 * built, so the instructions on an array item's handle are only the Studio's
 * when the manager is built with them. Mounts ArrayField to prove that, which
 * drag-a11y.test.ts's calls to the text functions cannot.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/svelte';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

vi.hoisted(() => {
	globalThis.ResizeObserver ??= class {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof ResizeObserver;
});

vi.mock('../src/lib/api/documents', () => ({
	documents: new Proxy({}, { get: () => async () => ({ success: false, data: null }) })
}));
vi.mock('../src/lib/schema-context.svelte', () => ({ getSchemaContext: () => [] }));

import ArrayField from '../src/lib/components/admin/fields/ArrayField.svelte';
import { dragInstructions } from '../src/lib/components/admin/fields/drag-a11y';
import { configureStudioI18n } from '../src/lib/i18n/index';

beforeEach(() =>
	configureStudioI18n({
		messages: {
			[dragInstructions().draggable]: 'Zum Aufnehmen die Leertaste druecken.',
			'Move item': 'Eintrag verschieben',
			'sortable item': 'sortierbarer Eintrag'
		}
	})
);
afterEach(() => {
	cleanup();
	configureStudioI18n({});
});

it('gives an array item handle a name and dnd-kit the Studio instructions', async () => {
	render(ArrayField, {
		props: {
			field: { name: 'tags', type: 'array', of: [{ type: 'string' }] } as never,
			value: ['a', 'b'],
			onUpdate: () => {}
		}
	});
	const handles = screen.getAllByRole('button', { name: 'Eintrag verschieben' });
	expect(handles).toHaveLength(2);
	expect(handles[0]).toHaveAttribute('aria-roledescription', 'sortierbarer Eintrag');
	await waitFor(() => {
		const described = document.getElementById(handles[0].getAttribute('aria-describedby') ?? '');
		expect(described).toHaveTextContent('Zum Aufnehmen die Leertaste druecken.');
	});
});

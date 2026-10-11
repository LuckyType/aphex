// @vitest-environment jsdom
/**
 * The calendar's month buttons and a dialog's close button take the Studio's
 * language. bits-ui merges its own English aria-label over a caller's, so the
 * month buttons only pass when they are drawn through a `child` snippet.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

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

import DateField from '../src/lib/components/admin/fields/DateField.svelte';
import ScheduleDialog from '../src/lib/components/admin/ScheduleDialog.svelte';
import { configureStudioI18n } from '../src/lib/i18n/index';

beforeEach(() =>
	configureStudioI18n({
		messages: {
			Close: 'Schliessen',
			'Previous month': 'Vorheriger Monat',
			'Next month': 'Naechster Monat'
		}
	})
);
afterEach(async () => {
	cleanup();
	configureStudioI18n({});
	// bits-ui restores the body style 24 ms after a dialog's scroll lock is
	// released; let that timer run while jsdom still has a document.
	await new Promise((resolve) => setTimeout(resolve, 50));
});

it('names the calendar month buttons', async () => {
	render(DateField, {
		props: {
			field: { name: 'day', type: 'date' } as never,
			value: '2026-10-11',
			onUpdate: () => {}
		}
	});
	// The popover trigger is the only button until the calendar opens.
	await fireEvent.click(screen.getByRole('button'));
	expect(await screen.findByRole('button', { name: 'Vorheriger Monat' })).toBeInTheDocument();
	expect(screen.getByRole('button', { name: 'Naechster Monat' })).toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'Previous' })).toBeNull();
});

it('names a dialog close button', async () => {
	render(ScheduleDialog, { props: { open: true, documentId: 'd1', action: 'publish' } });
	expect(await screen.findByRole('button', { name: 'Schliessen' })).toBeInTheDocument();
	expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
});

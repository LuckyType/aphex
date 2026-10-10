// @vitest-environment jsdom
/**
 * A field shows its broken rule once focus leaves it, a rule reads the whole
 * document as `context.document`, and the history panel works by keyboard
 * and names its state for a screen reader.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The client bundle loads @dnd-kit, which builds a ResizeObserver at import
// time; jsdom has none.
vi.hoisted(() => {
	globalThis.ResizeObserver ??= class {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof ResizeObserver;
});

const { listVersions, getVersion } = vi.hoisted(() => ({
	listVersions: vi.fn(),
	getVersion: vi.fn()
}));

vi.mock('../src/lib/api/documents', () => ({
	documents: { listVersions, getVersion }
}));

vi.mock('../src/lib/schema-context.svelte', () => ({ getSchemaContext: () => [] }));

import DocumentVersionPanel from '../src/lib/components/admin/DocumentVersionPanel.svelte';
import SchemaField from '../src/lib/components/admin/SchemaField.svelte';

afterEach(() => cleanup());

describe('SchemaField', () => {
	const email = {
		name: 'email',
		type: 'string',
		title: 'Email',
		validation: (Rule: { email: () => unknown }) => Rule.email()
	};

	function renderEmail(value: string) {
		return render(SchemaField, {
			props: { field: email as never, value, documentData: { email: value }, onUpdate: () => {} }
		});
	}

	it('shows the rule message once focus leaves an invalid value', async () => {
		renderEmail('not-an-email');
		const input = screen.getByRole('textbox');
		expect(screen.queryByRole('alert')).toBeNull();
		input.focus();
		await fireEvent.focusOut(input, { relatedTarget: document.body });
		expect(await screen.findByRole('alert')).toHaveTextContent(/email/i);
	});

	it('shows nothing for a valid value', async () => {
		renderEmail('info@example.com');
		const input = screen.getByRole('textbox');
		await fireEvent.focusOut(input, { relatedTarget: document.body });
		// Validation is async; give it the same turn the invalid case needs.
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(screen.queryByRole('alert')).toBeNull();
	});

	it('hands a rule the whole document as focus leaves the field', async () => {
		const endsAt = {
			name: 'endsAt',
			type: 'string',
			title: 'Ends',
			validation: (Rule: {
				custom: (fn: (v: unknown, c: { document?: { startsAt?: unknown } }) => unknown) => unknown;
			}) =>
				Rule.custom((value, context) =>
					value === context.document?.startsAt ? 'Ends when it starts' : true
				)
		};
		const documentData = { startsAt: '12:00', endsAt: '12:00' };
		render(SchemaField, {
			props: { field: endsAt as never, value: '12:00', documentData, onUpdate: () => {} }
		});
		const input = screen.getByRole('textbox');
		await fireEvent.focusOut(input, { relatedTarget: document.body });
		expect(await screen.findByRole('alert')).toHaveTextContent('Ends when it starts');
	});
});

describe('DocumentVersionPanel', () => {
	beforeEach(() => {
		listVersions.mockResolvedValue({
			success: true,
			data: [
				{ versionNumber: 2, eventType: 'publish', createdAt: '2026-09-30T10:00:00Z' },
				{ versionNumber: 1, eventType: 'draft', createdAt: '2026-09-30T09:00:00Z' }
			]
		});
		getVersion.mockResolvedValue({ success: true, data: { data: { title: 'x' } } });
	});

	it('opens a version from the keyboard and marks it pressed', async () => {
		const onPreviewVersion = vi.fn();
		const { container } = render(DocumentVersionPanel, {
			props: { documentId: 'doc-1', onClose: () => {}, onPreviewVersion }
		});
		await waitFor(() => expect(container.querySelectorAll('[data-version-id]')).toHaveLength(2));
		const entry = container.querySelector<HTMLElement>('[data-version-id="1"]');
		expect(entry).toHaveAttribute('role', 'button');
		expect(entry).toHaveAttribute('tabindex', '0');
		expect(entry).toHaveAttribute('aria-pressed', 'false');

		entry?.focus();
		expect(document.activeElement).toBe(entry);
		if (entry) await fireEvent.keyDown(entry, { key: 'Enter' });
		await waitFor(() => expect(onPreviewVersion).toHaveBeenCalledOnce());
		expect(onPreviewVersion.mock.calls[0]?.[0]).toMatchObject({ versionNumber: 1 });
		await waitFor(() => expect(entry).toHaveAttribute('aria-pressed', 'true'));
	});

	it('names the open history filter as pressed', async () => {
		const { container } = render(DocumentVersionPanel, {
			props: { documentId: 'doc-1', onClose: () => {} }
		});
		const pressed = () =>
			[...container.querySelectorAll('button[aria-pressed="true"]')].map((b) => b.textContent);
		await waitFor(() => expect(pressed()).toHaveLength(1));
		const [all, published] = container.querySelectorAll<HTMLElement>('button[aria-pressed]');
		expect(pressed()).toEqual([all?.textContent]);
		if (published) await fireEvent.click(published);
		expect(pressed()).toEqual([published?.textContent]);
	});
});

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

const { listVersions, getVersion, getById } = vi.hoisted(() => ({
	listVersions: vi.fn(),
	getVersion: vi.fn(),
	getById: vi.fn()
}));

vi.mock('../src/lib/api/documents', () => ({
	documents: { listVersions, getVersion, getById }
}));

vi.mock('../src/lib/schema-context.svelte', () => ({ getSchemaContext: () => [] }));

const pageSchema = {
	name: 'page',
	type: 'document',
	title: 'Page',
	fields: [
		{ name: 'title', type: 'string', title: 'Title' },
		{ name: 'blocks', type: 'array', title: 'Blocks', of: [] }
	]
} as never;

import DocumentVersionPanel from '../src/lib/components/admin/DocumentVersionPanel.svelte';
import SchemaField from '../src/lib/components/admin/SchemaField.svelte';

afterEach(() => cleanup());

describe('SchemaField', () => {
	it('names a checkbox once, beside it, with its description under it', () => {
		render(SchemaField, {
			props: {
				field: {
					name: 'featured',
					type: 'boolean',
					title: 'Featured',
					description: 'Shown first.'
				} as never,
				value: false,
				documentData: {},
				onUpdate: () => {}
			}
		});
		expect(screen.getAllByText('Featured')).toHaveLength(1);
		expect(screen.getByRole('checkbox', { name: 'Featured' })).toBeInTheDocument();
		const description = screen.getByText('Shown first.');
		expect(
			screen.getByRole('checkbox').compareDocumentPosition(description) &
				Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	});

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

	it('hands a datetime rule the stored ISO value, as the publish check does', async () => {
		const seen: unknown[] = [];
		const endsAt = {
			name: 'endsAt',
			type: 'datetime',
			title: 'Ends',
			options: { dateFormat: 'DD.MM.YYYY', timeFormat: 'HH:mm' },
			validation: (Rule: { custom: (fn: (v: unknown) => unknown) => unknown }) =>
				Rule.custom((value) => {
					seen.push(value);
					return 'Ends when it starts';
				})
		};
		// The form DateTimeField stores.
		const iso = '2026-10-24T11:57:00Z';
		render(SchemaField, {
			props: {
				field: endsAt as never,
				value: iso,
				documentData: { endsAt: iso },
				onUpdate: () => {}
			}
		});
		const input = screen.getByRole('textbox');
		await fireEvent.focusOut(input, { relatedTarget: document.body });
		expect(await screen.findByRole('alert')).toHaveTextContent('Ends when it starts');
		expect(seen).toContain(iso);
		expect(seen.every((value) => value === iso)).toBe(true);
	});

	it('still flags a datetime typed in a form that never parsed', async () => {
		const at = {
			name: 'at',
			type: 'datetime',
			title: 'At',
			options: { dateFormat: 'DD.MM.YYYY', timeFormat: 'HH:mm' }
		};
		render(SchemaField, {
			props: { field: at as never, value: '31.02.2026 10:00', documentData: {}, onUpdate: () => {} }
		});
		await fireEvent.focusOut(screen.getByRole('textbox'), { relatedTarget: document.body });
		expect(await screen.findByRole('alert')).toHaveTextContent(/datetime/i);
	});

	it('marks the control invalid and describes it by the shown message', async () => {
		renderEmail('not-an-email');
		const input = screen.getByRole('textbox');
		expect(input).not.toHaveAttribute('aria-invalid');
		expect(input).not.toHaveAttribute('aria-describedby');
		await fireEvent.focusOut(input, { relatedTarget: document.body });
		await screen.findByRole('alert');
		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(input).toHaveAccessibleDescription(/email/i);
	});

	it('describes a textarea by its message too', async () => {
		const description = {
			name: 'description',
			type: 'text',
			title: 'Description',
			validation: (Rule: { max: (n: number) => unknown }) => Rule.max(3)
		};
		render(SchemaField, {
			props: {
				field: description as never,
				value: 'too long',
				documentData: { description: 'too long' },
				onUpdate: () => {}
			}
		});
		const textarea = screen.getByRole('textbox');
		await fireEvent.focusOut(textarea, { relatedTarget: document.body });
		const alert = await screen.findByRole('alert');
		expect(textarea).toHaveAttribute('aria-invalid', 'true');
		expect(textarea.getAttribute('aria-describedby')).toBe(alert.parentElement?.id);
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
		getById.mockResolvedValue({
			success: true,
			data: { id: 'doc-1', _meta: { type: 'page', status: 'published', publishedHash: 'h' } }
		});
	});

	it('names what each version changed and marks the one published now', async () => {
		listVersions.mockResolvedValue({
			success: true,
			data: [
				{ versionNumber: 3, eventType: 'publish', data: { title: 'B', blocks: [] } },
				{ versionNumber: 2, eventType: 'draft', data: { title: 'B', blocks: [] } },
				{ versionNumber: 1, eventType: 'draft', data: { title: 'A', blocks: [] } }
			]
		});
		const { container } = render(DocumentVersionPanel, {
			props: { documentId: 'doc-1', schemas: [pageSchema], onClose: () => {} }
		});
		await waitFor(() => expect(container.querySelector('[data-current]')).not.toBeNull());
		const entries = [...container.querySelectorAll('[data-version-id]')];
		expect(entries.map((e) => e.hasAttribute('data-current'))).toEqual([true, false, false]);
		expect(entries[0]).toHaveTextContent('Currently published');
		const changes = entries.map((e) =>
			e.querySelector('[data-version-changes]')?.textContent?.trim()
		);
		// The first publish has no publish before it; the oldest draft nothing at all.
		expect(changes).toEqual([undefined, 'Changed: Title', undefined]);
	});

	it('marks nothing as published for an unpublished document', async () => {
		getById.mockResolvedValue({
			success: true,
			data: { id: 'doc-1', _meta: { type: 'page', status: 'unpublished', publishedHash: 'h' } }
		});
		const { container } = render(DocumentVersionPanel, {
			props: { documentId: 'doc-1', onClose: () => {} }
		});
		await waitFor(() => expect(container.querySelectorAll('[data-version-id]')).toHaveLength(2));
		await waitFor(() => expect(getById).toHaveBeenCalled());
		expect(container.querySelector('[data-current]')).toBeNull();
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

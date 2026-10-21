// @vitest-environment jsdom
/**
 * With `fieldErrors: 'touched'` a field keeps its errors to itself until it
 * was visited and left, an input reported it touched, a publish was tried,
 * or the document was published before.
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';
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
import {
	documentErrorsShown,
	focusLeavesField,
	type FieldTouch
} from '../src/lib/field-touch-context.svelte';
import { Rule } from '../src/lib/field-validation/rule';

afterEach(() => cleanup());

const title = {
	name: 'title',
	type: 'string',
	title: 'Title',
	validation: (rule: Rule) => rule.required()
} as never;

function touchContext(showAll = false) {
	const touched = new SvelteSet<string>();
	const touch: FieldTouch = {
		shows: (path) => showAll || touched.has(path),
		touch: (path) => {
			touched.add(path);
		}
	};
	return {
		touched,
		context: new Map<symbol, unknown>([[Symbol.for('aphex.admin.field-touch'), touch]])
	};
}

async function renderChecked(context: Map<symbol, unknown>) {
	const view = render(SchemaField, {
		context,
		props: { field: title, value: '', documentData: { title: '' }, onUpdate: () => {} }
	});
	await view.component.performValidation('');
	await tick();
	return view;
}

describe('field errors after touch', () => {
	it('checks an untouched field but shows nothing', async () => {
		const { context } = touchContext();
		await renderChecked(context);
		expect(screen.queryByRole('alert')).toBeNull();
	});

	it('shows the error once focus left the field', async () => {
		const { context, touched } = touchContext();
		await renderChecked(context);
		const input = screen.getByRole('textbox');
		await fireEvent.focusOut(input, { relatedTarget: document.body });
		await tick();
		expect(touched.has('title')).toBe(true);
		expect(screen.getByRole('alert')).toBeTruthy();
	});

	it('counts focus moving into a dialog as still on the field', async () => {
		const { context, touched } = touchContext();
		await renderChecked(context);
		const dialog = document.createElement('div');
		dialog.setAttribute('role', 'dialog');
		const inside = document.createElement('button');
		dialog.append(inside);
		document.body.append(dialog);
		await fireEvent.focusOut(screen.getByRole('textbox'), { relatedTarget: inside });
		expect(touched.has('title')).toBe(false);
		dialog.remove();
	});

	it('shows every error when the editor reveals all', async () => {
		const { context } = touchContext(true);
		await renderChecked(context);
		expect(screen.getByRole('alert')).toBeTruthy();
	});

	it('shows errors at once without the context, as before', async () => {
		await renderChecked(new Map());
		expect(screen.getByRole('alert')).toBeTruthy();
	});
});

describe('focusLeavesField', () => {
	it('stays inside for focus within the field or a dialog it opened', () => {
		const field = document.createElement('div');
		const own = document.createElement('input');
		field.append(own);
		const dialog = document.createElement('div');
		dialog.setAttribute('role', 'dialog');
		const picked = document.createElement('button');
		dialog.append(picked);
		document.body.append(field, dialog);
		expect(focusLeavesField(field, own)).toBe(false);
		expect(focusLeavesField(field, picked)).toBe(false);
		expect(focusLeavesField(field, document.body)).toBe(true);
		expect(focusLeavesField(field, null)).toBe(true);
		field.remove();
		dialog.remove();
	});

	it("stays inside for focus in a docked panel marked as the field's", () => {
		const field = document.createElement('div');
		const panel = document.createElement('section');
		panel.setAttribute('data-field-panel', '');
		const back = document.createElement('button');
		panel.append(back);
		const elsewhere = document.createElement('button');
		document.body.append(field, panel, elsewhere);
		expect(focusLeavesField(field, back)).toBe(false);
		expect(focusLeavesField(field, elsewhere)).toBe(true);
		field.remove();
		panel.remove();
		elsewhere.remove();
	});

	it('leaves for focus elsewhere in the dialog that holds the field', () => {
		const dialog = document.createElement('div');
		dialog.setAttribute('role', 'dialog');
		const field = document.createElement('div');
		const other = document.createElement('input');
		dialog.append(field, other);
		document.body.append(dialog);
		expect(focusLeavesField(field, other)).toBe(true);
		dialog.remove();
	});
});

describe('documentErrorsShown', () => {
	const fresh = { status: 'draft', publishedAt: null };
	it('shows everything unless the app holds errors back', () => {
		expect(documentErrorsShown({ mode: undefined, publishAttempted: false, meta: fresh })).toBe(
			true
		);
		expect(documentErrorsShown({ mode: 'always', publishAttempted: false, meta: null })).toBe(true);
	});
	it('holds back on a new or never published document until a publish is tried', () => {
		expect(documentErrorsShown({ mode: 'touched', publishAttempted: false, meta: null })).toBe(
			false
		);
		expect(documentErrorsShown({ mode: 'touched', publishAttempted: false, meta: fresh })).toBe(
			false
		);
		expect(documentErrorsShown({ mode: 'touched', publishAttempted: true, meta: fresh })).toBe(
			true
		);
	});
	it('shows everything on a document published before', () => {
		for (const meta of [
			{ status: 'published' },
			{ status: 'unpublished' },
			{ status: 'draft', publishedAt: '2026-10-01T00:00:00Z' }
		]) {
			expect(documentErrorsShown({ mode: 'touched', publishAttempted: false, meta })).toBe(true);
		}
	});
});

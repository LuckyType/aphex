/**
 * `unknownFields: 'strip'` on a document type drops keys the schema does not
 * declare, at every depth it describes, before validation and before the
 * row; the default keeps refusing them as structural.
 *
 * Lives in tests/ (not src/) so the package build never compiles it into dist.
 * Run: pnpm -F @aphexcms/cms-core test
 */
import { describe, expect, it } from 'vitest';
import { stripUnknownFields } from '../src/lib/schema-utils/unknown-fields';
import { validateDocumentData } from '../src/lib/field-validation/utils';
import type { SchemaType } from '../src/lib/types/schemas';
import { fakeCollection, fakeStore, systemCtx } from './helpers/fake-collection';

const container: SchemaType = {
	type: 'object',
	name: 'container',
	title: 'Container',
	fields: [
		{ name: 'label', type: 'string', title: 'Label' },
		{ name: 'children', type: 'array', title: 'Children', of: [{ type: 'container' }] }
	]
};

const page = (unknownFields?: 'reject' | 'strip'): SchemaType => ({
	type: 'document',
	name: 'page',
	title: 'Page',
	...(unknownFields ? { unknownFields } : {}),
	fields: [
		{ name: 'title', type: 'string', title: 'Title' },
		{ name: 'note', type: 'view', title: 'Note', input: 'note' },
		{
			name: 'seo',
			type: 'object',
			title: 'SEO',
			fields: [{ name: 'description', type: 'string', title: 'Description' }]
		},
		{
			name: 'layout',
			type: 'array',
			title: 'Layout',
			of: [
				{ type: 'container' },
				{
					type: 'object',
					name: 'quote',
					title: 'Quote',
					fields: [{ name: 'text', type: 'string', title: 'Text' }]
				},
				{ type: 'block' }
			]
		}
	]
});

const written = {
	title: 'Home',
	retired: true,
	note: 'never stored',
	seo: { description: 'd', keywords: 'old' },
	layout: [
		{
			_type: 'container',
			_key: 'c1',
			label: 'outer',
			embed: false,
			children: [{ _type: 'container', _key: 'c2', label: 'inner', embed: true }]
		},
		{ _type: 'quote', _key: 'q1', text: 't', author: 'gone' },
		{
			_type: 'block',
			_key: 'b1',
			style: 'normal',
			children: [{ _type: 'span', text: 'x' }],
			extra: 1
		},
		{ _type: 'mystery', _key: 'm1', anything: 1 }
	]
};

describe('stripUnknownFields', () => {
	it('drops undeclared keys at every depth the schema describes and keeps structure', () => {
		const stripped = stripUnknownFields(page().fields, written, { schemas: [page(), container] });
		expect(stripped).toEqual({
			title: 'Home',
			seo: { description: 'd' },
			layout: [
				{
					_type: 'container',
					_key: 'c1',
					label: 'outer',
					children: [{ _type: 'container', _key: 'c2', label: 'inner' }]
				},
				{ _type: 'quote', _key: 'q1', text: 't' },
				// Text blocks and items of a type the schema cannot resolve stay as they came.
				written.layout[2],
				written.layout[3]
			]
		});
		expect(written.seo).toEqual({ description: 'd', keywords: 'old' });
	});
});

describe('validation under unknownFields', () => {
	it('refuses undeclared keys by default', async () => {
		const result = await validateDocumentData(page(), { title: 'x', retired: true });
		expect(result.structuralErrors.map((e) => e.field)).toEqual(['retired']);
	});

	it('lets them through under strip, because the write path drops them', async () => {
		const result = await validateDocumentData(page('strip'), { title: 'x', retired: true });
		expect(result.errors).toEqual([]);
	});
});

describe('CollectionAPI under unknownFields: strip', () => {
	it('stores the document without the undeclared keys, on create and update', async () => {
		const store = fakeStore();
		const schema = page('strip');
		const api = fakeCollection(schema, store, {}, [schema, container]);

		// A text block without keys and an item of no declared type stay structural errors.
		const { layout, ...rest } = written;
		const created = await api.create(systemCtx, { ...rest, layout: layout.slice(0, 2) } as never);
		const id = created.document.id;
		const row = store.docs.get(id)!;
		expect(row.draftData).not.toHaveProperty('retired');
		expect(row.draftData).not.toHaveProperty('note');
		expect((row.draftData as { seo: object }).seo).toEqual({ description: 'd' });
		expect((row.draftData as { layout: object[] }).layout[0]).not.toHaveProperty('embed');

		await api.update(systemCtx, id, { title: 'Home 2', stale: 'yes' } as never);
		const updated = store.docs.get(id)!.draftData as Record<string, unknown>;
		expect(updated.title).toBe('Home 2');
		expect(updated).not.toHaveProperty('stale');
	});

	it('keeps refusing them under the default', async () => {
		const store = fakeStore();
		const api = fakeCollection(page(), store, {}, [page(), container]);
		await expect(api.create(systemCtx, { title: 'x', retired: true } as never)).rejects.toThrow(
			/retired/
		);
	});
});

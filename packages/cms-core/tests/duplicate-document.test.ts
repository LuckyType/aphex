import { afterEach, describe, expect, it, vi } from 'vitest';

const { getById, create } = vi.hoisted(() => ({ getById: vi.fn(), create: vi.fn() }));
vi.mock('../src/lib/api/documents', () => ({ documents: { getById, create } }));

import { duplicateDocument } from '../src/lib/duplicate-document';
import { configureStudio, studioDocumentActionShown } from '../src/lib/studio-extensions';
import { duplicateTitleField, duplicateValues } from '../src/lib/utils/duplicate';
import type { SchemaType } from '../src/lib/types/schemas';

const page = {
	name: 'page',
	type: 'document',
	title: 'Page',
	fields: [
		{ name: 'title', type: 'string', title: 'Title' },
		{ name: 'slug', type: 'slug', title: 'Slug', source: 'title' },
		{ name: 'blocks', type: 'array', title: 'Blocks', of: [{ type: 'text' }] }
	]
} as unknown as SchemaType;

const copyTitle = (title: string) => `${title} (copy)`;

afterEach(() => {
	configureStudio({});
	vi.clearAllMocks();
});

describe('duplicateValues', () => {
	it('marks the title as a copy and draws the slug again from it', () => {
		const blocks = [{ _key: 'a', _type: 'text', body: 'Hi' }];
		const copy = duplicateValues(
			page,
			{ title: 'Menu', slug: 'menu', blocks, extra: 1 },
			copyTitle
		);
		expect(copy).toEqual({ title: 'Menu (copy)', slug: 'menu-copy', blocks });
		expect(copy.blocks).not.toBe(blocks);
	});

	it('leaves an empty title and its slug empty', () => {
		expect(duplicateValues(page, { title: '', slug: 'x' }, copyTitle)).toEqual({ title: '' });
	});

	it('finds the title the preview names, else a conventional one', () => {
		const product = {
			fields: [
				{ name: 'label', type: 'string' },
				{ name: 'name', type: 'string' }
			],
			preview: { select: { title: 'name' } }
		} as unknown as SchemaType;
		expect(duplicateTitleField(product)).toBe('name');
		expect(duplicateTitleField({ ...product, preview: undefined })).toBe('name');
		expect(duplicateTitleField({ fields: [{ name: 'body', type: 'text' }] } as never)).toBeNull();
	});
});

describe('duplicateDocument', () => {
	it('creates a draft from the stored draft, shaped by the app last', async () => {
		getById.mockResolvedValue({
			success: true,
			data: { id: 'p1', type: 'page', title: 'Menu', slug: 'menu', path: '/menu', _meta: {} }
		});
		create.mockResolvedValue({ success: true, data: { id: 'p2' } });
		const prepare = vi.fn((values: Record<string, unknown>) => ({ ...values, slug: '' }));
		configureStudio({ prepareDuplicate: prepare });

		await expect(duplicateDocument('p1', page)).resolves.toBe('p2');
		expect(prepare).toHaveBeenCalledWith(
			{ title: 'Menu (copy)', slug: 'menu-copy' },
			expect.objectContaining({ type: 'page', id: 'p1', values: { title: 'Menu', slug: 'menu' } })
		);
		expect(create).toHaveBeenCalledWith({
			type: 'page',
			draftData: { title: 'Menu (copy)', slug: '' }
		});
	});

	it('uses the values it is handed and throws when the server refuses', async () => {
		create.mockResolvedValue({ success: false, error: 'Forbidden' });
		await expect(duplicateDocument('p1', page, { title: 'A' })).rejects.toThrow('Forbidden');
		expect(getById).not.toHaveBeenCalled();
	});
});

describe('studioDocumentActionShown', () => {
	const target = { type: 'page', id: 'p1', schema: page, values: {} };

	it('shows every entry unless the app says otherwise', () => {
		expect(studioDocumentActionShown('duplicate', target)).toBe(true);
		configureStudio({ documentActions: { inspect: () => false } });
		expect(studioDocumentActionShown('inspect', target)).toBe(false);
		expect(studioDocumentActionShown('duplicate', target)).toBe(true);
	});
});

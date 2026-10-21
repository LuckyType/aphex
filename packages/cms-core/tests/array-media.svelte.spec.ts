// @vitest-environment jsdom
/**
 * Rows of an array whose items are named by an image show that image and its
 * alt text, and such an array adds several images at once, one row each in
 * the order given.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte';
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

const { getById, uploadFile } = vi.hoisted(() => ({
	getById: vi.fn(async (id: string) => ({
		success: true,
		data: {
			id,
			url: `https://cdn.test/${id}.jpg`,
			mimeType: 'image/jpeg',
			alt: id === 'a1' ? 'Terrace at dusk' : null,
			title: null,
			originalFilename: `${id}.jpg`
		}
	})),
	uploadFile: vi.fn(async (file: File) => ({ success: true, data: { id: `up-${file.name}` } }))
}));

vi.mock('../src/lib/api/assets', () => ({ assets: { getById, uploadFile } }));
vi.mock('../src/lib/api/documents', () => ({
	documents: new Proxy({}, { get: () => async () => ({ success: false, data: null }) })
}));
vi.mock('../src/lib/schema-context.svelte', () => ({ getSchemaContext: () => [] }));

import ArrayField from '../src/lib/components/admin/fields/ArrayField.svelte';

afterEach(() => cleanup());

const gallery = {
	name: 'images',
	type: 'array',
	title: 'Images',
	of: [
		{
			type: 'object',
			name: 'galleryImage',
			title: 'Image',
			preview: { select: { title: 'caption', media: 'image' } },
			fields: [
				{ name: 'image', type: 'image', title: 'Image' },
				{ name: 'caption', type: 'string', title: 'Caption' }
			]
		}
	]
};

const photo = (key: string, ref: string, caption = '') => ({
	_type: 'galleryImage',
	_key: key,
	image: { _type: 'image', asset: { _type: 'reference', _ref: ref } },
	caption
});

it('shows each row by its image, named by its caption, alt text or file name', async () => {
	render(ArrayField, {
		props: {
			field: gallery as never,
			value: [photo('k1', 'a1'), photo('k2', 'a2'), photo('k3', 'a3', 'Our kitchen')],
			onUpdate: () => {}
		}
	});
	expect(await screen.findByText('Terrace at dusk')).toBeInTheDocument();
	expect(await screen.findByText('a2.jpg')).toBeInTheDocument();
	expect(screen.getByText('Our kitchen')).toBeInTheDocument();
	await waitFor(() => expect(document.querySelectorAll('img')).toHaveLength(3));
});

it('offers adding several images and adds dropped files as rows in order', async () => {
	const onUpdate = vi.fn();
	render(ArrayField, { props: { field: gallery as never, value: [], onUpdate } });
	expect(screen.getByRole('button', { name: 'Add images...' })).toBeInTheDocument();
	const files = [
		new File(['a'], 'one.jpg', { type: 'image/jpeg' }),
		new File(['b'], 'two.jpg', { type: 'image/jpeg' }),
		new File(['c'], 'notes.txt', { type: 'text/plain' })
	];
	await fireEvent.drop(screen.getByRole('group', { name: 'Images' }), {
		dataTransfer: { files, types: ['Files'] }
	});
	await waitFor(() => expect(onUpdate).toHaveBeenCalled());
	const rows = onUpdate.mock.lastCall![0] as Array<Record<string, any>>;
	expect(rows.map((row) => row.image.asset._ref)).toEqual(['up-one.jpg', 'up-two.jpg']);
	expect(rows.every((row) => row._type === 'galleryImage' && row._key && row.caption === '')).toBe(
		true
	);
});

it('keeps the single add button for items without media', () => {
	render(ArrayField, {
		props: {
			field: {
				name: 'rows',
				type: 'array',
				title: 'Rows',
				of: [
					{
						type: 'object',
						name: 'row',
						title: 'Row',
						fields: [{ name: 'a', type: 'string', title: 'A' }]
					}
				]
			} as never,
			value: [],
			onUpdate: () => {}
		}
	});
	expect(screen.queryByRole('button', { name: 'Add images...' })).toBeNull();
	expect(screen.getByRole('button', { name: 'Add item...' })).toBeInTheDocument();
});

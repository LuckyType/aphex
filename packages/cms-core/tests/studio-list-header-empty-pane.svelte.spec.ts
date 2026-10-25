// @vitest-environment jsdom
/**
 * Two places an app can fill in the Content area: a line above one type's
 * list (`documentLists.<type>.header`), shown whether the list is empty or
 * not, and the pane right of the types column while no type is open
 * (`emptyPane`), which can open a type.
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from './fixtures/reactive-page.svelte';
import { configureStudio } from '../src/lib/studio-extensions';
import ListHeader from './fixtures/ListHeader.svelte';
import EmptyPane from './fixtures/EmptyPane.svelte';

vi.hoisted(() => {
	globalThis.ResizeObserver ??= class {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof ResizeObserver;
	Element.prototype.scrollIntoView ??= () => {};
	// Svelte's transitions call it; jsdom has no Web Animations.
	// Each one finishes at once, so an outro removes its element.
	Element.prototype.animate ??= (() => {
		const animation = {
			cancel() {},
			finish() {},
			currentTime: 0,
			set onfinish(done: () => void) {
				queueMicrotask(done);
			}
		};
		return animation;
	}) as unknown as typeof Element.prototype.animate;
	window.matchMedia ??= (() => ({
		matches: false,
		addEventListener() {},
		removeEventListener() {}
	})) as unknown as typeof window.matchMedia;
});

vi.mock('$app/state', async () => await import('./fixtures/reactive-page.svelte'));
vi.mock('$app/navigation', () => ({
	goto: vi.fn(async () => {}),
	invalidateAll: async () => {},
	beforeNavigate: () => {},
	afterNavigate: () => {},
	pushState: () => {},
	replaceState: () => {}
}));

vi.mock('../src/lib/api/index', async (original) => ({
	...(await original<object>()),
	documents: {
		list: async ({ docType }: { docType: string }) => ({
			success: true,
			data:
				docType === 'page'
					? [{ id: 'p1', type: 'page', title: 'Home', _meta: { type: 'page' } }]
					: [],
			pagination: { total: docType === 'page' ? 1 : 0, page: 1, pageSize: 50, totalPages: 1 }
		}),
		getById: async () => ({ success: false })
	},
	organizations: { list: async () => ({ success: true, data: [] }) }
}));

const { default: AdminAppHarness } = await import('./fixtures/AdminAppHarness.svelte');
const { goto } = await import('$app/navigation');

const schemas = [
	{ type: 'document', name: 'page', title: 'Page', fields: [{ name: 'title', type: 'string' }] },
	{ type: 'document', name: 'note', title: 'Note', fields: [{ name: 'title', type: 'string' }] }
];
const documentTypes = [
	{ name: 'page', title: 'Page' },
	{ name: 'note', title: 'Note' }
];

afterEach(() => {
	cleanup();
	configureStudio({});
});

function open(url: string) {
	Object.defineProperty(window, 'innerWidth', { value: 1400, configurable: true });
	page.url = new URL(url);
	render(AdminAppHarness, { schemas: schemas as never, documentTypes });
}

describe('documentLists.<type>.header', () => {
	it('stands above a list with rows', async () => {
		configureStudio({
			documentLists: { page: { header: ListHeader }, note: { header: ListHeader } }
		});
		open('http://localhost/admin?docType=page');
		expect(await screen.findByText('Home')).toBeTruthy();
		expect(screen.getByText('Header for page')).toBeTruthy();
	});

	it('stands above an empty list too', async () => {
		configureStudio({ documentLists: { note: { header: ListHeader } } });
		open('http://localhost/admin?docType=note');
		expect(await screen.findByText('Header for note')).toBeTruthy();
	});

	it('is left out for a type that names none', async () => {
		configureStudio({ documentLists: { note: { header: ListHeader } } });
		open('http://localhost/admin?docType=page');
		expect(await screen.findByText('Home')).toBeTruthy();
		expect(screen.queryByText(/Header for/)).toBeNull();
	});
});

describe('emptyPane', () => {
	it('fills the space beside the types while none is open, and opens a type', async () => {
		configureStudio({ emptyPane: EmptyPane });
		open('http://localhost/admin');
		const button = await screen.findByRole('button', { name: 'Open Note' });
		expect(screen.getByRole('button', { name: 'Open Page' })).toBeTruthy();
		await fireEvent.click(button);
		expect(vi.mocked(goto)).toHaveBeenCalledWith(
			expect.stringContaining('docType=note'),
			expect.anything()
		);
	});

	it('goes once a type is open', async () => {
		configureStudio({ emptyPane: EmptyPane });
		open('http://localhost/admin?docType=page');
		expect(await screen.findByText('Home')).toBeTruthy();
		expect(screen.queryByRole('list', { name: 'Empty pane' })).toBeNull();
	});
});

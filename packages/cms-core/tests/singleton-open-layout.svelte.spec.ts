// @vitest-environment jsdom
/**
 * Opening a singleton type (`?docType=<singleton>` without a `docId`) looks
 * its one document up before the editor can show it. Meanwhile the Studio
 * shows that singleton's own layout, not the screen it came from: the list
 * of the type open before stayed on show for the whole round trip.
 */
import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page } from './fixtures/reactive-page.svelte';

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

const lookups: string[] = [];
vi.mock('../src/lib/api/index', async (original) => ({
	...(await original<object>()),
	documents: {
		list: async ({ type }: { type: string }) => {
			lookups.push(type);
			// The singleton's id never arrives: the test looks at the wait.
			if (type === 'settings') return new Promise(() => {});
			return {
				success: true,
				data: [{ id: 'p1', type: 'page', title: 'Home', _meta: { type: 'page' } }],
				pagination: { total: 1, page: 1, pageSize: 50, totalPages: 1 }
			};
		},
		getById: async () => ({ success: false })
	},
	organizations: { list: async () => ({ success: true, data: [] }) }
}));

const { default: AdminAppHarness } = await import('./fixtures/AdminAppHarness.svelte');

const schemas = [
	{
		type: 'document',
		name: 'page',
		title: 'Page',
		fields: [{ name: 'title', type: 'string', title: 'Title' }]
	},
	{
		type: 'document',
		name: 'settings',
		title: 'Settings',
		singleton: true,
		fields: [{ name: 'siteName', type: 'string', title: 'Site name' }]
	}
];

afterEach(cleanup);

/** Whether a Tailwind `hidden` on the element or an ancestor takes it off screen. */
function hidden(element: Element): boolean {
	for (let at: Element | null = element; at; at = at.parentElement) {
		if (at.classList.contains('hidden')) return true;
	}
	return false;
}

describe('opening a singleton type', () => {
	it('drops the previous list at once while its document is looked up', async () => {
		Object.defineProperty(window, 'innerWidth', { value: 1400, configurable: true });
		page.url = new URL('http://localhost/admin?docType=page');
		render(AdminAppHarness, {
			schemas: schemas as never,
			documentTypes: [
				{ name: 'page', title: 'Page' },
				{ name: 'settings', title: 'Settings' }
			]
		});
		expect(await screen.findByText('Home')).toBeTruthy();

		page.url = new URL('http://localhost/admin?docType=settings');
		await vi.waitFor(() => expect(hidden(screen.getByText('Home'))).toBe(true));
		expect(lookups).toContain('settings');
		expect(document.querySelector('[aria-busy="true"]')).not.toBeNull();
	});
});

// @vitest-environment jsdom
/**
 * The header's area tabs (Structure, Media) belong to an app that hands the
 * Sidebar its active area. An app that reaches its areas from its own
 * sidebar links leaves `activeTab` out and gets no tab strip, with the
 * header's own controls still at its right edge.
 */
import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';

window.matchMedia ??= (() => ({
	matches: false,
	addEventListener() {},
	removeEventListener() {}
})) as unknown as typeof window.matchMedia;

const { default: SidebarHarness } = await import('./fixtures/SidebarHarness.svelte');

const data = { user: { id: 'u1', email: 'a@example.test', name: 'A' } };

afterEach(cleanup);

describe('the header area tabs', () => {
	it('show for an app that hands over the active area', () => {
		render(SidebarHarness, { data, activeTab: { value: 'structure' } } as never);
		expect(screen.queryByRole('button', { name: 'Structure' })).not.toBeNull();
	});

	it('stay away without one', () => {
		render(SidebarHarness, { data, onTabChange: () => {} } as never);
		expect(screen.queryByRole('button', { name: 'Structure' })).toBeNull();
		// The header's own controls still sit at its right edge.
		expect(document.querySelector('header .ml-auto')).not.toBeNull();
	});
});

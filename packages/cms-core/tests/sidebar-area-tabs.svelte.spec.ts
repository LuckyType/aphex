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

describe('a nav item badge', () => {
	it('shows beside the label and reads as its label, not as a bare number', () => {
		render(SidebarHarness, {
			data: {
				...data,
				navGroups: [
					{
						id: 'main',
						items: [
							{ href: '/admin/inbox', label: 'Inbox', badge: 3, badgeLabel: '3 new messages' },
							{ href: '/admin/pages', label: 'Pages' }
						]
					}
				]
			}
		} as never);
		const link = screen.getByRole('link', { name: 'Inbox, 3 new messages' });
		const badge = link.parentElement?.querySelector('[data-sidebar="menu-badge"]');
		expect(badge?.textContent?.trim()).toBe('3');
		expect(badge?.getAttribute('aria-hidden')).toBe('true');
		const pages = screen.getByRole('link', { name: 'Pages' });
		expect(pages.parentElement?.querySelector('[data-sidebar="menu-badge"]')).toBeNull();
	});
});

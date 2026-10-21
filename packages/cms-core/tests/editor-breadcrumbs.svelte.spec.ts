// @vitest-environment jsdom
/**
 * The editor's breadcrumbs name every level, each one a way back to it, and
 * the item in view is no link.
 */
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
	globalThis.ResizeObserver ??= class {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof ResizeObserver;
});

import EditorBreadcrumbs from '../src/lib/components/admin/EditorBreadcrumbs.svelte';

afterEach(cleanup);

describe('EditorBreadcrumbs', () => {
	it('goes to a level by its crumb and up one level by the arrow', async () => {
		const toList = vi.fn();
		const toSection = vi.fn();
		const up = vi.fn();
		render(EditorBreadcrumbs, {
			crumbs: [
				{ label: 'Pages', select: toList },
				{ label: 'Home', select: vi.fn() },
				{ label: 'Section', select: toSection },
				{ label: 'Button', title: 'Book a table' }
			],
			onUp: up,
			upLabel: 'Back'
		});

		await fireEvent.click(screen.getByRole('button', { name: 'Section' }));
		expect(toSection).toHaveBeenCalledOnce();
		await fireEvent.click(screen.getByRole('button', { name: 'Pages' }));
		expect(toList).toHaveBeenCalledOnce();
		await fireEvent.click(screen.getByRole('button', { name: 'Back' }));
		expect(up).toHaveBeenCalledOnce();

		const current = screen.getByText('Button');
		expect(current).toHaveAttribute('aria-current', 'page');
		expect(current).toHaveAttribute('title', 'Book a table');
		expect(screen.queryByRole('button', { name: 'Button' })).toBeNull();
		expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
	});

	it('has no arrow without a level to go up to', () => {
		render(EditorBreadcrumbs, { crumbs: [{ label: 'Navigation' }], onUp: null, upLabel: 'Back' });
		expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
	});
});

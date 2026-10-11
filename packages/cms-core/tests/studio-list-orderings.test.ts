import { afterEach, describe, expect, it } from 'vitest';
import {
	configureStudio,
	orderedListPage,
	studioListOrderings,
	type StudioDocumentListRow,
	type StudioListOrdering
} from '../src/lib/studio-extensions';

function row(id: string): StudioDocumentListRow {
	return { id, title: id, status: 'published', hasChanges: false, updatedAt: null };
}

const reversed: StudioListOrdering = {
	name: 'reversed',
	title: 'Reversed',
	sort: (rows) => [...rows].reverse()
};

afterEach(() => configureStudio({}));

describe('studioListOrderings', () => {
	it('is empty without the hook, for no type, and for a type the hook skips', () => {
		expect(studioListOrderings('page')).toEqual([]);
		configureStudio({ listOrderings: (type) => (type === 'page' ? [reversed] : null) });
		expect(studioListOrderings(null)).toEqual([]);
		expect(studioListOrderings('post')).toEqual([]);
		expect(studioListOrderings('page')).toEqual([reversed]);
	});
});

describe('orderedListPage', () => {
	const rows = ['a', 'b', 'c', 'd', 'e'].map(row);

	it('orders every row before cutting the page, so the order runs across pages', () => {
		const first = orderedListPage(rows, reversed, 1, 2);
		const last = orderedListPage(rows, reversed, 3, 2);
		expect(first.rows.map((r) => r.id)).toEqual(['e', 'd']);
		expect(last.rows.map((r) => r.id)).toEqual(['a']);
		expect(first.total).toBe(5);
		expect(first.totalPages).toBe(3);
	});

	it('keeps one page for an empty list', () => {
		expect(orderedListPage([], reversed, 1, 20)).toEqual({ rows: [], total: 0, totalPages: 1 });
	});
});

import { describe, expect, it } from 'vitest';
import { slugSourceTitle } from '../src/lib/utils/slug';

describe('slugSourceTitle', () => {
	it('names the source by its sibling field title', () => {
		expect(slugSourceTitle('title', [{ name: 'title', title: 'Headline' }])).toBe('Headline');
	});

	it('prefers a sibling over a document field of the same name', () => {
		expect(
			slugSourceTitle(
				'name',
				[{ name: 'name', title: 'Item name' }],
				[{ name: 'name', title: 'Name' }]
			)
		).toBe('Item name');
	});

	it('falls back to the document fields', () => {
		expect(
			slugSourceTitle('title', [{ name: 'slug' }], [{ name: 'title', title: 'Page title' }])
		).toBe('Page title');
	});

	it('falls back to the field name without a schema title', () => {
		expect(slugSourceTitle('title')).toBe('title');
		expect(slugSourceTitle('title', [{ name: 'title', title: '' }])).toBe('title');
	});
});

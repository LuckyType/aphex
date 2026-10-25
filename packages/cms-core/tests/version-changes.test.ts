import { describe, expect, it } from 'vitest';
import { summarizeVersions } from '../src/lib/utils/version-changes';

// Newest first, as the versions list returns them.
const versions = [
	{ versionNumber: 5, eventType: 'publish', data: { title: 'B', body: [1, 2] } },
	{ versionNumber: 4, eventType: 'draft', data: { title: 'B', body: [1, 2] } },
	{ versionNumber: 3, eventType: 'draft', data: { title: 'A', body: [1, 2] } },
	{ versionNumber: 2, eventType: 'publish', data: { title: 'A', body: [1] } },
	{ versionNumber: 1, eventType: 'draft', data: { body: [1], title: 'A' } }
];

describe('summarizeVersions', () => {
	it('names what a draft changed against the version before it', () => {
		const summaries = summarizeVersions(versions, { published: true });
		expect(summaries.get(4)?.changed).toEqual(['title']);
		expect(summaries.get(3)?.changed).toEqual(['body']);
		// Key order is no change.
		expect(summaries.get(2)?.changed).toBeNull();
		expect(summaries.get(1)?.changed).toBeNull();
	});

	it('names what a publish changed for visitors, against the publish before it', () => {
		const summaries = summarizeVersions(versions, { fields: ['title', 'body'], published: true });
		expect(summaries.get(5)?.changed).toEqual(['title', 'body']);
	});

	it('marks the newest publish as current only while the document is published', () => {
		const live = summarizeVersions(versions, { published: true });
		expect([...live].filter(([, s]) => s.current).map(([n]) => n)).toEqual([5]);
		const unpublished = summarizeVersions(versions, { published: false });
		expect([...unpublished].some(([, s]) => s.current)).toBe(false);
	});

	it('compares only the named fields, an unset one as empty', () => {
		const summaries = summarizeVersions(
			[
				{ versionNumber: 2, eventType: 'draft', data: { title: 'A', note: null, _x: 1 } },
				{ versionNumber: 1, eventType: 'draft', data: { title: 'A' } }
			],
			{ fields: ['title', 'note'], published: false }
		);
		expect(summaries.get(2)?.changed).toEqual([]);
	});
});

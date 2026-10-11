import { describe, expect, it } from 'vitest';
import { computePaneLayout, type PaneLayoutInput } from '../src/lib/components/pane-layout';

const base: PaneLayoutInput = {
	editorOpen: true,
	stackedColumn: false,
	activeEditorIndex: 0,
	hasDocs: true,
	typesShown: true,
	available: 1024
};

describe('computePaneLayout', () => {
	it('keeps the documents list open beside an editor when the types column is hidden', () => {
		// A single-type space at a 1280px window leaves about 1024px for the panes:
		// 1024 - 350 = 674 clears the editor minimum, so nothing collapses.
		const layout = computePaneLayout({ ...base, typesShown: false });
		expect(layout.docsExpanded).toBe(true);
		expect(layout.expandedIndices).toEqual([0]);
	});

	it('collapses the documents list when a shown types strip leaves the editor too little', () => {
		// 1024 - 60 - 350 = 614, under the minimum: types collapses, then docs.
		const layout = computePaneLayout(base);
		expect(layout.typesExpanded).toBe(false);
		expect(layout.docsExpanded).toBe(false);
	});

	it('keeps both lists open when there is room for them and the editor', () => {
		const layout = computePaneLayout({ ...base, available: 1400 });
		expect(layout.typesExpanded).toBe(true);
		expect(layout.docsExpanded).toBe(true);
	});

	it('never collapses a list the user just opened', () => {
		const layout = computePaneLayout({ ...base, activeEditorIndex: -2, available: 800 });
		expect(layout.docsExpanded).toBe(true);
		expect(layout.expandedIndices).toEqual([0]);
	});

	it('returns open lists with no editor', () => {
		const layout = computePaneLayout({ ...base, editorOpen: false, available: 300 });
		expect(layout.totalEditors).toBe(0);
		expect(layout.typesExpanded).toBe(true);
		expect(layout.docsExpanded).toBe(true);
	});
});

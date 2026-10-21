import { describe, expect, it } from 'vitest';
import { EditorTrail, foldable, middleCut, type EditorCrumb } from '../src/lib/editor-trail.svelte';

function labels(crumbs: EditorCrumb[]): string[] {
	return crumbs.map((crumb) => crumb.label);
}

describe('EditorTrail', () => {
	it('lists the root, then every open panel in the order they opened', () => {
		const trail = new EditorTrail(() => [{ label: 'Pages' }, { label: 'Home' }]);
		const outer = trail.register();
		const inner = trail.register();
		outer.set({ crumbs: [{ label: 'Section' }], close: () => {} });
		inner.set({ crumbs: [{ label: 'Button' }], close: () => {} });
		expect(labels(trail.crumbs)).toEqual(['Pages', 'Home', 'Section', 'Button']);
		expect(trail.open).toBe(true);
	});

	it('keeps a panel in its place when it reports new steps', () => {
		const trail = new EditorTrail();
		const outer = trail.register();
		const inner = trail.register();
		outer.set({ crumbs: [{ label: 'Section' }], close: () => {} });
		inner.set({ crumbs: [{ label: 'Text' }], close: () => {} });
		outer.set({ crumbs: [{ label: 'Row' }], close: () => {} });
		expect(labels(trail.panels)).toEqual(['Row', 'Text']);
		inner.set(null);
		expect(labels(trail.panels)).toEqual(['Row']);
	});

	it('goes up one level inside a panel that opened an item several levels down', () => {
		const went: string[] = [];
		const trail = new EditorTrail();
		trail.register().set({
			crumbs: [
				{ label: 'Section', select: () => went.push('Section') },
				{ label: 'Row', select: () => went.push('Row') },
				{ label: 'Button' }
			],
			close: () => went.push('closed')
		});
		expect(trail.up()).toBe(true);
		expect(went).toEqual(['Row']);
	});

	it('closes the inner panel when going up from its only step', () => {
		const went: string[] = [];
		const trail = new EditorTrail();
		trail
			.register()
			.set({ crumbs: [{ label: 'Section' }], close: () => went.push('outer closed') });
		trail.register().set({ crumbs: [{ label: 'Text' }], close: () => went.push('inner closed') });
		trail.up();
		expect(went).toEqual(['inner closed']);
	});

	it('closes the last panel back to the document', () => {
		const went: string[] = [];
		const trail = new EditorTrail();
		trail.register().set({ crumbs: [{ label: 'Section' }], close: () => went.push('closed') });
		expect(trail.up()).toBe(true);
		expect(went).toEqual(['closed']);
	});

	it('has nothing to go up to without a panel', () => {
		expect(new EditorTrail().up()).toBe(false);
	});

	it('closes the panels below a crumb, innermost first, before going to it', () => {
		const went: string[] = [];
		const trail = new EditorTrail();
		trail.register().set({
			crumbs: [{ label: 'Section', select: () => went.push('Section') }, { label: 'Row' }],
			close: () => went.push('outer closed')
		});
		trail.register().set({ crumbs: [{ label: 'Grid' }], close: () => went.push('middle closed') });
		trail.register().set({ crumbs: [{ label: 'Text' }], close: () => went.push('inner closed') });
		trail.panels[0].select?.();
		expect(went).toEqual(['inner closed', 'middle closed', 'Section']);
	});

	it('closes every panel, innermost first', () => {
		const went: string[] = [];
		const trail = new EditorTrail();
		trail.register().set({ crumbs: [{ label: 'A' }], close: () => went.push('A') });
		trail.register().set({ crumbs: [{ label: 'B' }], close: () => went.push('B') });
		trail.closeAll();
		expect(went).toEqual(['B', 'A']);
	});
});

describe('middleCut', () => {
	const crumbs = ['Pages', 'Home', 'Section 1', 'Section 2', 'Section 3', 'Button'].map(
		(label) => ({ label })
	);

	function shown(hidden: number): string[] {
		return middleCut(crumbs, hidden).map((item) =>
			item.kind === 'more' ? `...(${labels(item.crumbs).join(',')})` : item.crumb.label
		);
	}

	it('shows every crumb when nothing is hidden', () => {
		expect(shown(0)).toEqual(['Pages', 'Home', 'Section 1', 'Section 2', 'Section 3', 'Button']);
	});

	it('folds the middle away from the start, keeping the first two and the last', () => {
		expect(shown(2)).toEqual(['Pages', 'Home', '...(Section 1,Section 2)', 'Section 3', 'Button']);
		expect(shown(3)).toEqual(['Pages', 'Home', '...(Section 1,Section 2,Section 3)', 'Button']);
	});

	it('never folds more than the middle', () => {
		expect(foldable(crumbs.length)).toBe(3);
		expect(shown(9)).toEqual(shown(3));
		expect(foldable(3)).toBe(0);
		expect(middleCut(crumbs.slice(0, 3), 2)).toHaveLength(3);
	});
});

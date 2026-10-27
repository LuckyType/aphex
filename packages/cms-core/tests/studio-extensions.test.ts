/**
 * The Studio hooks that take a value or a function: the inline script nonce is
 * read per render so an app can hand out the current response's nonce, and
 * the sidebar's groups follow the app's `groupOrder`.
 *
 * Lives in tests/ (not src/) so the package build never compiles it into dist.
 * Run: pnpm -F @aphexcms/cms-core test
 */
import { afterEach, describe, expect, it } from 'vitest';
import {
	configureStudio,
	createTemplates,
	createTitleField,
	createWithTitleValues,
	orderedGroups,
	studioListActions,
	studioDocumentList,
	studioDocumentTree,
	studioScriptNonce,
	type StudioDocumentTree
} from '../src/lib/studio-extensions';

afterEach(() => configureStudio({}));

describe('studioScriptNonce', () => {
	it('is undefined when the app set none', () => {
		expect(studioScriptNonce()).toBeUndefined();
	});

	it('returns a fixed string as given', () => {
		configureStudio({ scriptNonce: 'abc' });
		expect(studioScriptNonce()).toBe('abc');
	});

	it('calls a function on every render', () => {
		let n = 0;
		configureStudio({ scriptNonce: () => `nonce-${++n}` });
		expect(studioScriptNonce()).toBe('nonce-1');
		expect(studioScriptNonce()).toBe('nonce-2');
	});
});

describe('orderedGroups', () => {
	const groups = [{ name: null }, { name: 'Content' }, { name: 'Settings' }, { name: 'Shop' }];

	it('keeps first-seen order without a groupOrder', () => {
		expect(orderedGroups(groups, undefined).map((g) => g.name)).toEqual([
			null,
			'Content',
			'Settings',
			'Shop'
		]);
	});

	it('puts named groups in the given order, ungrouped first, the rest after', () => {
		expect(orderedGroups(groups, ['Shop', 'Content']).map((g) => g.name)).toEqual([
			null,
			'Shop',
			'Content',
			'Settings'
		]);
	});
});

describe('studioDocumentList', () => {
	const List = (() => null) as never;

	it('is empty for a type the app did not name', () => {
		configureStudio({ documentLists: { page: List } });
		expect(studioDocumentList('product')).toEqual({});
		expect(studioDocumentList(null)).toEqual({});
	});

	it('reads a bare component as the list with the generic words', () => {
		configureStudio({ documentLists: { page: List } });
		expect(studioDocumentList('page')).toEqual({ component: List });
	});

	it('keeps the words an app sets beside its list, with or without a component', () => {
		configureStudio({
			documentLists: {
				page: { component: List, createLabel: () => 'New page' },
				product: { emptyText: () => 'No products yet' }
			}
		});
		expect(studioDocumentList('page').component).toBe(List);
		expect(studioDocumentList('page').createLabel?.()).toBe('New page');
		expect(studioDocumentList('page').emptyText).toBeUndefined();
		expect(studioDocumentList('product').component).toBeUndefined();
		expect(studioDocumentList('product').emptyText?.()).toBe('No products yet');
	});
});

describe('studioDocumentTree', () => {
	const component = (() => {}) as unknown as StudioDocumentTree['component'];
	const menu: StudioDocumentTree = { types: ['menu', 'section', 'dish'], component };

	it('is null for every type when the app set no tree', () => {
		expect(studioDocumentTree('menu')).toBeNull();
		expect(studioDocumentTree(null)).toBeNull();
	});

	it('finds the tree for each of its types and none for another', () => {
		configureStudio({ documentTrees: [menu] });
		expect(studioDocumentTree('menu')).toBe(menu);
		expect(studioDocumentTree('dish')).toBe(menu);
		expect(studioDocumentTree('page')).toBeNull();
	});

	it('gives a type named by two trees to the first', () => {
		const other: StudioDocumentTree = { types: ['dish'], component };
		configureStudio({ documentTrees: [menu, other] });
		expect(studioDocumentTree('dish')).toBe(menu);
	});
});

describe('createTitleField', () => {
	it('asks for nothing unless the list says so', () => {
		configureStudio({ documentLists: { page: { createLabel: () => 'New page' } } });
		expect(createTitleField('page')).toBeNull();
		expect(createTitleField('post')).toBeNull();
	});

	it('fills `title`, or the field the list names', () => {
		configureStudio({
			documentLists: {
				page: { createWithTitle: true },
				product: { createWithTitle: { field: 'name' } }
			}
		});
		expect(studioDocumentList('page').createWithTitle).toBe(true);
		expect(createTitleField('page')).toBe('title');
		expect(createTitleField('product')).toBe('name');
	});
});

describe('createWithTitleValues', () => {
	it('is null for a list that creates without asking', () => {
		expect(createWithTitleValues('page', 'About us')).toBeNull();
	});

	it('puts the title into its field, with what the list derives from it', () => {
		configureStudio({
			documentLists: {
				page: {
					createWithTitle: { values: (title) => ({ heading: title, title: 'ignored' }) }
				},
				product: { createWithTitle: { field: 'name' } }
			}
		});
		expect(createTitleField('page')).toBe('title');
		expect(createWithTitleValues('page', 'About us')).toEqual({
			heading: 'About us',
			title: 'About us'
		});
		expect(createWithTitleValues('product', 'Tea')).toEqual({ name: 'Tea' });
	});

	it("takes the picked template's values in place of the list's own", () => {
		configureStudio({
			documentLists: {
				page: {
					createWithTitle: {
						values: (title) => ({ heading: title }),
						templates: () => [
							{ name: 'blank', title: 'Blank', values: (title) => ({ heading: title }) },
							{
								name: 'contact',
								title: 'Contact',
								suggestedTitle: 'Contact',
								values: (title) => ({ heading: title, form: true })
							}
						]
					}
				}
			}
		});
		expect(createTemplates('page').map((entry) => entry.name)).toEqual(['blank', 'contact']);
		expect(createWithTitleValues('page', 'Reach us', 'contact')).toEqual({
			heading: 'Reach us',
			form: true,
			title: 'Reach us'
		});
		// An unknown or missing pick falls back to the list's values.
		expect(createWithTitleValues('page', 'About', 'gone')).toEqual({
			heading: 'About',
			title: 'About'
		});
		expect(createWithTitleValues('page', 'About', null)).toEqual({
			heading: 'About',
			title: 'About'
		});
	});
});

describe('createTemplates', () => {
	it('is empty for a list without templates', () => {
		configureStudio({ documentLists: { page: { createWithTitle: true } } });
		expect(createTemplates('page')).toEqual([]);
		expect(createTemplates('product')).toEqual([]);
	});
});

describe('studioListActions', () => {
	it('lists none unless the list adds some', () => {
		expect(studioListActions('page')).toEqual([]);
	});

	it("returns the list's actions, from a list that sets only actions", () => {
		const run = () => {};
		configureStudio({
			documentLists: { page: { actions: () => [{ name: 'tidy', title: 'Tidy', run }] } }
		});
		expect(studioDocumentList('page').component).toBeUndefined();
		expect(studioListActions('page')).toEqual([{ name: 'tidy', title: 'Tidy', run }]);
	});
});

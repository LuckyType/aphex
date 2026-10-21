/**
 * The editor leaves out a field group tab whose fields are all hidden, so a
 * tab never opens onto an empty pane.
 *
 * Lives in tests/ (not src/) so the package build never compiles it into dist.
 * Run: pnpm -F @aphexcms/cms-core test
 */
import { describe, expect, it } from 'vitest';
import {
	fieldGroupTab,
	fieldGroupTabCount,
	fieldGroupTabsNeeded,
	fieldsetHeading,
	visibleFieldGroups
} from '../src/lib/schema-utils/field-groups';
import type { Field, FieldGroup } from '../src/lib/types/schemas';

const groups: FieldGroup[] = [
	{ name: 'general', title: 'General', default: true },
	{ name: 'food', title: 'Food' },
	{ name: 'extra', title: 'Extra', hidden: true },
	{ name: 'empty', title: 'Empty' }
];

const fields: Field[] = [
	{ name: 'name', type: 'string', title: 'Name', group: 'general' },
	{
		name: 'vegan',
		type: 'boolean',
		title: 'Vegan',
		group: 'food',
		hidden: ({ documentData }) => documentData.kind !== 'food'
	},
	{ name: 'note', type: 'string', title: 'Note', group: 'extra' }
];

const names = (list: FieldGroup[]) => list.map((g) => g.name);

describe('visibleFieldGroups', () => {
	it('drops a group whose every field is hidden, and one with no fields', () => {
		expect(names(visibleFieldGroups(groups, fields, { kind: 'service' }))).toEqual(['general']);
	});

	it('keeps the group once one of its fields applies', () => {
		expect(names(visibleFieldGroups(groups, fields, { kind: 'food' }))).toEqual([
			'general',
			'food'
		]);
	});

	it('still drops a group marked hidden, and counts fields the caller hides', () => {
		expect(
			names(visibleFieldGroups(groups, fields, { kind: 'food' }, (f) => f.name === 'vegan'))
		).toEqual(['general']);
	});

	it('reads a field listed in several groups for each of them', () => {
		const shared: Field[] = [
			{ name: 'price', type: 'number', title: 'Price', group: ['general', 'food'] }
		];
		expect(names(visibleFieldGroups(groups, shared, {}))).toEqual(['general', 'food']);
	});
});

describe('fieldGroupTabsNeeded', () => {
	const tabs = (data: Record<string, unknown>, list: Field[] = fields) =>
		fieldGroupTabsNeeded(visibleFieldGroups(groups, list, data), list, data);

	it('shows no tabs when one group holds every field the editor renders', () => {
		const grouped = fields.filter((f) => f.name !== 'note');
		expect(tabs({ kind: 'service' }, grouped)).toBe(false);
	});

	it('shows them once a second group applies', () => {
		const grouped = fields.filter((f) => f.name !== 'note');
		expect(tabs({ kind: 'food' }, grouped)).toBe(true);
	});

	it('shows them while a field outside the one group still renders under All fields', () => {
		expect(tabs({ kind: 'service' })).toBe(true);
	});

	it('shows none with no group left', () => {
		expect(fieldGroupTabsNeeded([], fields, {})).toBe(false);
	});
});

describe('field group tabs without "All fields"', () => {
	const tabGroups: FieldGroup[] = [
		{ name: 'colours', title: 'Colours' },
		{ name: 'type', title: 'Type' }
	];
	const tabFields: Field[] = [
		{ name: 'intro', type: 'string', title: 'Intro' },
		{ name: 'primary', type: 'string', title: 'Primary', group: 'colours' },
		{ name: 'accent', type: 'string', title: 'Accent', group: 'colours' },
		{ name: 'font', type: 'string', title: 'Font', group: 'type' },
		{ name: 'both', type: 'string', title: 'Both', group: ['colours', 'type'] }
	];

	it('puts a field of no shown group under the first tab', () => {
		expect(fieldGroupTab(tabFields[0], tabGroups, false)).toBe('colours');
		expect(fieldGroupTab(tabFields[0], tabGroups, true)).toBe('all');
		expect(fieldGroupTab(tabFields[3], tabGroups, false)).toBe('type');
	});

	it('counts what each tab shows', () => {
		const count = (tab: string, allFields: boolean) =>
			fieldGroupTabCount(tab, tabGroups, tabFields, {}, allFields);
		expect(count('colours', false)).toBe(4);
		expect(count('type', false)).toBe(2);
		expect(count('colours', true)).toBe(3);
		expect(count('all', true)).toBe(5);
	});

	it('needs two groups for tabs, since one group is the whole form', () => {
		const one = [tabGroups[0]];
		expect(fieldGroupTabsNeeded(one, tabFields, {}, () => false, false)).toBe(false);
		expect(fieldGroupTabsNeeded(one, tabFields, {}, () => false, true)).toBe(true);
		expect(fieldGroupTabsNeeded(tabGroups, tabFields, {}, () => false, false)).toBe(true);
	});
});

describe('fieldsetHeading', () => {
	const fieldsets = [
		{ name: 'layout', title: 'Layout' },
		{ name: 'style', title: 'Style' }
	];

	it('heads the first field of each run of one fieldset', () => {
		const fields = [
			{ name: 'a' },
			{ name: 'b', fieldset: 'layout' },
			{ name: 'c', fieldset: 'layout' },
			{ name: 'd', fieldset: 'style' }
		];
		expect(fields.map((field, i) => fieldsetHeading(fieldsets, field, fields[i - 1]))).toEqual([
			null,
			'Layout',
			null,
			'Style'
		]);
	});

	it('has no heading for a fieldset the schema does not declare', () => {
		expect(fieldsetHeading(fieldsets, { fieldset: 'other' }, undefined)).toBeNull();
		expect(fieldsetHeading(undefined, { fieldset: 'layout' }, undefined)).toBeNull();
	});
});

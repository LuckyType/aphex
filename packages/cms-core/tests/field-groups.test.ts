/**
 * The editor leaves out a field group tab whose fields are all hidden, so a
 * tab never opens onto an empty pane.
 *
 * Lives in tests/ (not src/) so the package build never compiles it into dist.
 * Run: pnpm -F @aphexcms/cms-core test
 */
import { describe, expect, it } from 'vitest';
import { visibleFieldGroups } from '../src/lib/schema-utils/field-groups';
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

/**
 * A new array item starts with every field of its type present: a declared
 * `initialValue`, else the field type's empty value. Before this a new item
 * carried only `_type` and `_key`, so a field's `hidden` or `validation` saw
 * `undefined` where a saved item has `''` or `[]`.
 *
 * Lives in tests/ (not src/) so the package build never compiles it into dist.
 * Run: pnpm -F @aphexcms/cms-core test
 */
import { describe, it, expect } from 'vitest';
import { newArrayItem } from '../src/lib/utils/field-defaults';
import type { Field } from '../src/lib/types/schemas';

const fields = [
	{ name: 'heading', type: 'string', title: 'Heading' },
	{ name: 'variant', type: 'string', title: 'Variant', initialValue: 'wide' },
	{ name: 'items', type: 'array', title: 'Items', of: [{ type: 'string' }] },
	{ name: 'enabled', type: 'boolean', title: 'Enabled' },
	{ name: 'stamp', type: 'string', title: 'Stamp', initialValue: () => 'later' }
] as unknown as Field[];

describe('newArrayItem', () => {
	it('fills every field with its initial value or the type default', () => {
		const item = newArrayItem({ fields }, 'teaser', () => 'k1');
		expect(item).toEqual({
			_type: 'teaser',
			_key: 'k1',
			heading: '',
			variant: 'wide',
			items: [],
			enabled: false,
			stamp: ''
		});
	});

	it('copes with a type that declares no fields', () => {
		expect(newArrayItem({}, 'divider', () => 'k2')).toEqual({ _type: 'divider', _key: 'k2' });
	});
});

import { describe, it, expect } from 'vitest';
import { Rule } from '../src/lib/field-validation/rule';

// Regression: a `date` field validated against a display format other than ISO (the Studio
// locale's `DD.MM.YYYY`) must still accept the stored ISO value. Dates inside array items and
// objects are validated as stored, so refusing ISO made every such document unpublishable.
describe('Rule.date', () => {
	const errors = async (value: string, format = 'DD.MM.YYYY') =>
		(await new Rule('date').date(format).validate(value)).filter((m) => m.level === 'error');

	it('accepts the stored ISO form whatever the display format', async () => {
		expect(await errors('2026-12-24')).toHaveLength(0);
		expect(await errors('2026-12-24', 'MM/DD/YYYY')).toHaveLength(0);
	});

	it('still accepts the display format', async () => {
		expect(await errors('24.12.2026')).toHaveLength(0);
	});

	it('rejects an impossible ISO date', async () => {
		expect((await errors('2026-02-31')).length).toBeGreaterThan(0);
		expect((await errors('2026-13-01')).length).toBeGreaterThan(0);
	});

	it('rejects text that is no date', async () => {
		expect((await errors('morgen')).length).toBeGreaterThan(0);
	});
});

describe('validateDocumentData with a date inside array items', () => {
	it('publishes stored ISO dates in array items of a field shown as DD.MM.YYYY', async () => {
		const { validateDocumentData } = await import('../src/lib/field-validation/utils');
		const schema = {
			name: 'hours',
			type: 'document',
			title: 'Hours',
			fields: [
				{
					name: 'exceptions',
					type: 'array',
					title: 'Exceptions',
					of: [
						{
							type: 'object',
							name: 'exception',
							fields: [
								{ name: 'date', type: 'date', title: 'Date', options: { dateFormat: 'DD.MM.YYYY' } }
							]
						}
					]
				}
			]
		} as any;
		const result = await validateDocumentData(schema, {
			exceptions: [{ _key: 'a', _type: 'exception', date: '2026-12-24' }]
		});
		expect(result.errors).toEqual([]);
	});
});

/**
 * A `hidden` predicate receives the object one level up (`parentData`) and
 * the facts the app registered with `configureFieldConditions` (`app`), in
 * the validator as in the renderer, so a nested field can follow its
 * parent's choice and a schema can read a per-app fact.
 *
 * Lives in tests/ (not src/) so the package build never compiles it into dist.
 * Run: pnpm -F @aphexcms/cms-core test
 */
import { afterEach, describe, expect, it } from 'vitest';
import { configureFieldConditions, isFieldVisible } from '../src/lib/schema-utils/visibility';
import { validateDocumentData } from '../src/lib/field-validation/utils';
import type { FieldVisibilityContext, SchemaType } from '../src/lib/types/schemas';

afterEach(() => configureFieldConditions({}));

describe('isFieldVisible', () => {
	it('passes parentData and an empty app by default', () => {
		let seen: FieldVisibilityContext | undefined;
		const field = {
			name: 'x',
			type: 'string' as const,
			title: 'X',
			hidden: (ctx: FieldVisibilityContext) => ((seen = ctx), false)
		};
		expect(isFieldVisible(field, { a: 1 }, { root: true }, { parentData: { p: 2 } })).toBe(true);
		expect(seen?.parentData).toEqual({ p: 2 });
		expect(seen?.app).toEqual({});
	});

	it('hands every predicate what the app configured, read on each call', () => {
		let segment = 'restaurant';
		configureFieldConditions({ context: () => ({ segment }) });
		const field = {
			name: 'allergens',
			type: 'string' as const,
			title: 'Allergens',
			hidden: ({ app }: FieldVisibilityContext) => app.segment !== 'restaurant'
		};
		expect(isFieldVisible(field, {}, {})).toBe(true);
		segment = 'service';
		expect(isFieldVisible(field, {}, {})).toBe(false);
	});

	it('treats a throwing context as empty', () => {
		configureFieldConditions({
			context: () => {
				throw new Error('no store');
			}
		});
		const field = {
			name: 'x',
			type: 'string' as const,
			title: 'X',
			hidden: ({ app }: FieldVisibilityContext) => Object.keys(app).length > 0
		};
		expect(isFieldVisible(field, {}, {})).toBe(true);
	});
});

describe('validation', () => {
	const page: SchemaType = {
		type: 'document',
		name: 'page',
		title: 'Page',
		fields: [
			{ name: 'layout', type: 'string', title: 'Layout' },
			{
				name: 'rows',
				type: 'array',
				title: 'Rows',
				of: [
					{
						type: 'object',
						name: 'row',
						title: 'Row',
						fields: [
							{
								name: 'span',
								type: 'number',
								title: 'Span',
								// Only a column layout asks for a span: the row reads its parent, the page.
								hidden: ({ parentData }) => parentData?.layout !== 'columns',
								validation: (Rule) => Rule.required()
							},
							{
								name: 'cells',
								type: 'object',
								title: 'Cells',
								fields: [
									{
										name: 'gap',
										type: 'number',
										title: 'Gap',
										// The object's parent is the row, not the page.
										hidden: ({ parentData }) => parentData?.kind !== 'grid',
										validation: (Rule) => Rule.required()
									}
								]
							},
							{ name: 'kind', type: 'string', title: 'Kind' }
						]
					}
				]
			},
			{
				name: 'allergens',
				type: 'string',
				title: 'Allergens',
				hidden: ({ app }) => app.segment !== 'restaurant',
				validation: (Rule) => Rule.required()
			}
		]
	};

	it('skips a nested required field hidden by its parent, and validates it when shown', async () => {
		const hidden = await validateDocumentData(page, {
			layout: 'stack',
			rows: [{ _type: 'row', _key: 'a', kind: 'list', cells: {} }]
		});
		expect(hidden.errors).toEqual([]);

		const shown = await validateDocumentData(page, {
			layout: 'columns',
			rows: [{ _type: 'row', _key: 'a', kind: 'grid', cells: {} }]
		});
		expect(shown.errors.flatMap((e) => e.errors)).toEqual([
			'Field "rows[0].span" Required',
			'Field "rows[0].cells.gap" Required'
		]);
	});

	it('reads the app context the validator side was given', async () => {
		configureFieldConditions({ context: () => ({ segment: 'service' }) });
		const service = await validateDocumentData(page, { layout: 'stack' });
		expect(service.errors).toEqual([]);

		configureFieldConditions({ context: () => ({ segment: 'restaurant' }) });
		const restaurant = await validateDocumentData(page, { layout: 'stack' });
		expect(restaurant.errors.map((e) => e.field)).toEqual(['allergens']);
	});
});

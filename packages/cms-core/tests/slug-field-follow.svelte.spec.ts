// @vitest-environment jsdom
/**
 * The slug input follows its source as the title is typed, and keeps a slug
 * someone typed themselves.
 */
import { cleanup, render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/schema-context.svelte', () => ({ getSchemaContext: () => [] }));

import SlugField from '../src/lib/components/admin/fields/SlugField.svelte';

afterEach(() => cleanup());

const field = { name: 'slug', type: 'slug', title: 'Slug', source: 'title' } as const;

describe('SlugField following its source', () => {
	it('fills from the title and follows it', async () => {
		const onUpdate = vi.fn();
		const view = render(SlugField, {
			props: { field, value: '', documentData: { title: 'About' }, onUpdate }
		});
		await tick();
		expect(onUpdate).toHaveBeenLastCalledWith('about');
		await view.rerender({ field, value: 'about', documentData: { title: 'About us' }, onUpdate });
		await tick();
		expect(onUpdate).toHaveBeenLastCalledWith('about-us');
	});

	it('leaves a slug of its own alone', async () => {
		const onUpdate = vi.fn();
		const view = render(SlugField, {
			props: { field, value: 'team', documentData: { title: 'About' }, onUpdate }
		});
		await view.rerender({ field, value: 'team', documentData: { title: 'About us' }, onUpdate });
		await tick();
		expect(onUpdate).not.toHaveBeenCalled();
	});

	it('uses the field slugify for following and Generate', async () => {
		const onUpdate = vi.fn();
		render(SlugField, {
			props: {
				field: { ...field, slugify: (text: string) => `x-${text.toLowerCase()}` },
				value: '',
				documentData: { title: 'About' },
				onUpdate
			}
		});
		await tick();
		expect(onUpdate).toHaveBeenLastCalledWith('x-about');
	});

	it('stays put while read-only', async () => {
		const onUpdate = vi.fn();
		render(SlugField, {
			props: { field, value: '', documentData: { title: 'About' }, onUpdate, readonly: true }
		});
		await tick();
		expect(onUpdate).not.toHaveBeenCalled();
	});
});

/**
 * A slug follows its source while it is empty or still the old source made
 * into a slug, and stays once someone typed their own.
 *
 * Run: pnpm -F @aphexcms/cms-core test
 */
import { describe, expect, it } from 'vitest';
import { followedSlug, withFollowedSlugs } from '../src/lib/utils/slug';

describe('followedSlug', () => {
	it('fills an empty slug from the source', () => {
		expect(followedSlug('', '', 'About us')).toBe('about-us');
		expect(followedSlug(undefined, undefined, 'About us')).toBe('about-us');
	});

	it('follows while the slug is still the old source made into a slug', () => {
		expect(followedSlug('about', 'About', 'About us')).toBe('about-us');
	});

	it('stays once someone typed their own', () => {
		expect(followedSlug('team', 'About', 'About us')).toBeNull();
	});

	it('does nothing while the source is unchanged', () => {
		expect(followedSlug('', 'About', 'About')).toBeNull();
	});

	it('empties with the source', () => {
		expect(followedSlug('about', 'About', '')).toBe('');
	});

	it('uses the field slugify', () => {
		const slugify = (text: string) => text.toLowerCase().replace('ü', 'ue').replace(/\s+/g, '-');
		expect(followedSlug('', '', 'Über uns', slugify)).toBe('ueber-uns');
		expect(followedSlug('ueber-uns', 'Über uns', 'Über uns hier', slugify)).toBe('ueber-uns-hier');
	});
});

describe('withFollowedSlugs', () => {
	const fields = [
		{ name: 'title', type: 'string' },
		{ name: 'slug', type: 'slug', source: 'title' }
	];

	it('fills an empty slug from the values it starts with', () => {
		expect(withFollowedSlugs(fields, { title: 'Our team' })).toEqual({
			title: 'Our team',
			slug: 'our-team'
		});
	});

	it('reads the title when the slug names no source, with its own slugify', () => {
		const custom = [{ name: 'path', type: 'slug', slugify: (text: string) => `x-${text}` }];
		expect(withFollowedSlugs(custom, { title: 'a' })).toEqual({ title: 'a', path: 'x-a' });
	});

	it('keeps a slug that has a value, and one whose source is empty', () => {
		expect(withFollowedSlugs(fields, { title: 'Our team', slug: 'team' }).slug).toBe('team');
		expect(withFollowedSlugs(fields, { title: '  ' })).toEqual({ title: '  ' });
	});
});

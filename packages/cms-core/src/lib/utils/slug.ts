/**
 * Generate a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns A URL-safe slug string
 */
export function generateSlug(text: string): string {
	if (!text) return '';

	return (
		text
			.toString()
			.toLowerCase()
			.trim()
			// Replace spaces and multiple special characters with single hyphens
			.replace(/[^a-z0-9]+/g, '-')
			// Remove leading and trailing hyphens
			.replace(/^-+|-+$/g, '')
	);
}

/**
 * Validate if a string is a valid slug
 * @param slug - The slug to validate
 * @returns Boolean indicating if the slug is valid
 */
export function isValidSlug(slug: string): boolean {
	if (!slug) return false;

	// Valid slug: lowercase letters, numbers, and hyphens only
	// Cannot start or end with hyphen
	const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
	return slugPattern.test(slug);
}

/**
 * The label to name a slug's `source` field by: its schema title, looked up
 * among the slug's sibling fields first and the document's fields second (the
 * same order its value is read in), falling back to the field name.
 */
export function slugSourceTitle(
	source: string,
	siblingFields?: ReadonlyArray<{ name: string; title?: string }>,
	documentFields?: ReadonlyArray<{ name: string; title?: string }>
): string {
	const field =
		siblingFields?.find((f) => f.name === source) ?? documentFields?.find((f) => f.name === source);
	return field?.title || source;
}

/**
 * The slug a field that follows its source moves to when the source changes
 * from `before` to `source`, or null to leave it. The slug follows while it is
 * empty or still reads as the old source made into a slug; once someone typed
 * their own, it stays.
 */
export function followedSlug(
	current: unknown,
	before: unknown,
	source: unknown,
	slugify: (text: string) => string = generateSlug
): string | null {
	if (source === before) return null;
	const shown = typeof current === 'string' ? current : '';
	const following = shown === '' || (typeof before === 'string' && shown === slugify(before));
	if (!following) return null;
	const next = typeof source === 'string' ? slugify(source) : '';
	return next === shown ? null : next;
}

/**
 * `values` with every top-level slug field that is still empty filled from
 * its source, as the slug field would fill it once drawn. A document
 * created with values (say, a title asked for before the editor opens)
 * would otherwise keep an empty slug until someone opens the slug's tab.
 */
export function withFollowedSlugs(
	fields: ReadonlyArray<{
		name: string;
		type: string;
		source?: string;
		slugify?: (text: string) => string;
	}>,
	values: Record<string, unknown>
): Record<string, unknown> {
	const filled = { ...values };
	for (const field of fields) {
		if (field.type !== 'slug') continue;
		const current = filled[field.name];
		if (typeof current === 'string' && current !== '') continue;
		const source = filled[field.source || 'title'];
		if (typeof source !== 'string' || source.trim() === '') continue;
		filled[field.name] = (field.slugify ?? generateSlug)(source);
	}
	return filled;
}

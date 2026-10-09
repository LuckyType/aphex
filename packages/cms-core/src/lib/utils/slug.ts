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

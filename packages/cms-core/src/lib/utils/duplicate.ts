import type { SchemaType } from '../types/schemas';
import { withFollowedSlugs } from './slug';

const TITLE_FIELDS = ['title', 'heading', 'name', 'label'];

/**
 * The top-level string field that names a document of `schema`: the one
 * `preview.select.title` points at when that is a plain field name, else the
 * first conventional title field the schema declares.
 */
export function duplicateTitleField(schema: Pick<SchemaType, 'fields' | 'preview'>): string | null {
	const strings = new Set(
		schema.fields.filter((f) => f.type === 'string' || f.type === 'text').map((f) => f.name)
	);
	const selected = schema.preview?.select?.title;
	if (typeof selected === 'string' && strings.has(selected)) return selected;
	return TITLE_FIELDS.find((name) => strings.has(name)) ?? null;
}

/**
 * What a copy of a document starts with: its field values, the title
 * passed through `copyTitle` ("Menu" becomes "Menu (copy)"), and every
 * top-level slug drawn again from the new title, so the copy does not
 * claim the original's address. Keys the schema does not declare are left
 * out.
 */
export function duplicateValues(
	schema: Pick<SchemaType, 'fields' | 'preview'>,
	values: Record<string, unknown>,
	copyTitle: (title: string) => string
): Record<string, unknown> {
	const copy: Record<string, unknown> = {};
	for (const field of schema.fields) {
		if (values[field.name] === undefined) continue;
		// A JSON round trip, not structuredClone: the editor's values are
		// reactive proxies, which structuredClone refuses.
		copy[field.name] = JSON.parse(JSON.stringify(values[field.name]));
	}
	const titleField = duplicateTitleField(schema);
	const title = titleField ? copy[titleField] : undefined;
	if (titleField && typeof title === 'string' && title.trim() !== '') {
		copy[titleField] = copyTitle(title);
	}
	for (const field of schema.fields) {
		if (field.type === 'slug') delete copy[field.name];
	}
	return withFollowedSlugs(schema.fields as never, copy);
}

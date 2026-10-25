// Copies a document into a new, never published draft. Plain TS, safe for
// the universal barrel: the Studio's document actions menu calls it, and an
// app's own list or tree can call it the same way.
import { documents } from './api/documents';
import * as i18n from './i18n/index';
import { studioExtensions, type StudioDocumentActionTarget } from './studio-extensions';
import type { SchemaType } from './types/schemas';
import { duplicateValues } from './utils/duplicate';

/**
 * The draft values of the document `id`, read as the editor reads them:
 * each of `schema`'s fields the document holds.
 */
async function draftValues(id: string, schema: SchemaType): Promise<Record<string, unknown>> {
	const res = await documents.getById(id);
	if (!res.success || !res.data) throw new Error(res.error || 'Document not found');
	const doc = res.data as Record<string, unknown>;
	const values: Record<string, unknown> = {};
	for (const field of schema.fields) {
		if (doc[field.name] !== undefined) values[field.name] = doc[field.name];
	}
	return values;
}

/**
 * Creates a copy of the document `id` of `schema`'s type as a new draft
 * (never published) and returns the copy's id. The copy's values come
 * from `duplicateValues`, then the app's `prepareDuplicate`. `values`
 * skips reading the original when the caller already holds its draft.
 */
export async function duplicateDocument(
	id: string,
	schema: SchemaType,
	values?: Record<string, unknown>
): Promise<string> {
	const original: StudioDocumentActionTarget = {
		type: schema.name,
		id,
		schema,
		values: values ?? (await draftValues(id, schema))
	};
	let copy = duplicateValues(schema, original.values, (title) =>
		i18n.t('{title} (copy)', { title })
	);
	const prepare = studioExtensions().prepareDuplicate;
	if (prepare) copy = prepare(copy, original);
	const res = await documents.create({ type: schema.name, draftData: copy });
	if (!res.success || !res.data) throw new Error(res.error || 'Failed to duplicate');
	return res.data.id;
}

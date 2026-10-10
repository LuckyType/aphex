import type { Field, ViewField } from '../types/schemas';

/** A `view` field: a display slot that holds no value. See `ViewField`. */
export function isViewField(field: Pick<Field, 'type'>): field is ViewField {
	return field.type === 'view';
}

/** `fields` without its view slots: the ones a stored document has keys for. */
export function storedFields<F extends Pick<Field, 'type'>>(fields: readonly F[]): F[] {
	return fields.filter((field) => !isViewField(field));
}

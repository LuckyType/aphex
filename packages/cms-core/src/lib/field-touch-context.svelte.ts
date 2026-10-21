import { getContext, setContext } from 'svelte';
import { hasBeenPublished } from './save-state-context.svelte';

const FIELD_TOUCH_KEY = Symbol.for('aphex.admin.field-touch');

/**
 * Which fields show their validation errors, for an editor that holds them
 * back until someone got to a field (`configureStudio({ fieldErrors:
 * 'touched' })`). Fields are named by their path (`seo.title`), as
 * `SchemaField` builds it.
 */
export interface FieldTouch {
	/** Whether the field at `path` shows its errors. */
	shows(path: string): boolean;
	/** Marks the field at `path` as touched, so its errors show from now on. */
	touch(path: string): void;
}

export function setFieldTouchContext(touch: FieldTouch): void {
	setContext(FIELD_TOUCH_KEY, touch);
}

export function getFieldTouchContext(): FieldTouch | null {
	return getContext<FieldTouch>(FIELD_TOUCH_KEY) ?? null;
}

/**
 * For a custom input that knows better than focus when someone is done
 * with a field (say, when the panel of a new list entry closes): returns a
 * function that marks the field at `path` as touched. Does nothing outside
 * an editor that holds errors back. Call during component setup.
 */
export function useFieldTouch(): (path: string) => void {
	const touch = getFieldTouchContext();
	return (path) => touch?.touch(path);
}

/**
 * Whether focus moving from a field to `next` leaves it. Focus that moves
 * into a dialog (a picker or an entry's panel the field opened) is still
 * work on the field; so is focus that stays inside it. A panel that is no
 * dialog (one docked beside the form) counts as one when it carries
 * `data-field-panel`.
 */
export function focusLeavesField(field: HTMLElement, next: EventTarget | null): boolean {
	if (!(next instanceof Element)) return true;
	if (field.contains(next)) return false;
	const dialog = next.closest('[role="dialog"], [role="alertdialog"], [data-field-panel]');
	return !dialog || dialog.contains(field);
}

/** What `documentErrorsShown` reads off the open document. */
export interface FieldErrorsState {
	mode: 'always' | 'touched' | undefined;
	/** A publish was tried in this editor since the document opened. */
	publishAttempted: boolean;
	/** The stored document's `_meta`, null for a document not yet saved. */
	meta: { status?: string | null; publishedAt?: unknown } | null | undefined;
}

/**
 * Whether every field of the document shows its errors regardless of touch:
 * always unless the app chose `'touched'`, and then once a publish was tried
 * or when the document has been published before (its problems are the
 * live site's).
 */
export function documentErrorsShown({ mode, publishAttempted, meta }: FieldErrorsState): boolean {
	return mode !== 'touched' || publishAttempted || hasBeenPublished(meta);
}

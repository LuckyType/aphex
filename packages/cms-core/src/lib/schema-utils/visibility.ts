import type { Field, FieldCondition, FieldVisibilityContext } from '../types/schemas';

/**
 * Conditional field visibility.
 *
 * A schema often has fields that only make sense for one branch of a choice: a
 * link's target document matters only when it's an internal link, a hero's
 * alignment only when the hero is text, a form's redirect URL only when it
 * redirects. Showing them all at once makes an editor read a form full of
 * controls that do nothing, and there is no way to tell which ones those are.
 *
 * `hidden` is a predicate on the field:
 *
 * ```ts
 * {
 *   name: 'reference', type: 'reference', to: [{ type: 'page' }],
 *   hidden: ({ siblingData }) => siblingData.linkType !== 'reference'
 * }
 * ```
 *
 * ## Two scopes, and why sibling comes first
 *
 * `siblingData` is the object the field is a member of — the array item, the
 * inline object, or the document itself at the top level. `documentData` is
 * always the whole document.
 *
 * A condition almost always means "my neighbour's value", and inside a repeated
 * array item that distinction is the whole ballgame: three link rows each have
 * their own `linkType`, and resolving against the document would make all three
 * follow the first one. Both are passed so a condition can reach either, but
 * sibling is the one to reach for.
 *
 * ## Parent and app
 *
 * `parentData` is the object one level up from `siblingData` (undefined at the
 * root), for a nested field that follows a choice on its parent. `app` is what
 * the app registered with `configureFieldConditions({ context })`: facts no
 * document holds, such as which segment the site serves. Both sides of the
 * single-source rule below read the same setup, so configure it where the
 * server boots and where the Studio mounts.
 *
 * ## Hidden means not validated
 *
 * A hidden field is skipped by validation as well as by the renderer. Otherwise
 * a required `url` on a link that has been switched to internal blocks the save
 * with an error pointing at a field nobody can see — the worst failure mode a
 * form can have.
 *
 * The value is *kept*, not cleared. Toggling a choice twice must not destroy
 * what was typed under the other branch, and an editor who switches back
 * expects their URL to still be there.
 *
 * ## This is not access control
 *
 * `hidden` decides what an editor is shown. It is not a security boundary: the
 * value is still in the document, still in API responses, and still writable by
 * anything that posts to the API. Use `access` on the field for that — it strips
 * reads and drops writes at the API boundary. A field hidden here and assumed
 * protected is a data leak waiting to happen.
 */

export type { FieldCondition, FieldVisibilityContext };

/**
 * What the app contributes to every `hidden` predicate.
 *
 * `context` is read on each call, so it can answer from a per-request or
 * per-process source. Set it once where the app boots on the server and once
 * where the Studio mounts: the validator and the renderer each read it from
 * their own module instance, and a fact only one side knows makes a field
 * that is hidden in the editor but still validated, or the reverse.
 */
export interface FieldConditionSetup {
	/** Facts every condition receives as `app`. Called on each evaluation. */
	context?: () => Record<string, unknown>;
}

let setup: FieldConditionSetup = {};

export function configureFieldConditions(next: FieldConditionSetup): void {
	setup = next;
}

function appContext(): Record<string, unknown> {
	try {
		return setup.context?.() ?? {};
	} catch {
		return {};
	}
}

/** The scope around a field that its own object does not show. */
export interface FieldVisibilityScope {
	/** The object holding the field's owner; see `FieldVisibilityContext.parentData`. */
	parentData?: Record<string, unknown>;
}

/**
 * Should this field be rendered and validated?
 *
 * The single source of truth for the answer, deliberately: the admin renderer and
 * the server-side validator both call this. Two implementations would drift, and
 * the way they drift is "the form won't save and nothing on screen says why".
 *
 * A throwing condition resolves to *visible*. A broken predicate should surface
 * as a field that shouldn't be there, not as one that has silently vanished
 * along with whatever the editor typed into it.
 */
export function isFieldVisible(
	field: Field,
	siblingData: Record<string, unknown> | undefined,
	documentData: Record<string, unknown> | undefined,
	scope: FieldVisibilityScope = {}
): boolean {
	const hidden = (field as { hidden?: FieldCondition }).hidden;
	if (typeof hidden !== 'function') return true;

	const sibling = siblingData ?? documentData ?? {};
	try {
		return !hidden({
			siblingData: sibling,
			documentData: documentData ?? sibling,
			parentData: scope.parentData,
			app: appContext()
		});
	} catch {
		return true;
	}
}

// Hooks an app can hand the Studio to show its own text or components in a
// few places cms-core otherwise renders generically. Set once with
// `configureStudio` before the Studio renders. Plain TS (the Svelte imports
// are type-only), safe for the universal barrel.
import type { Component } from 'svelte';
import type { Field, SchemaType } from './types/schemas';

export interface StudioListBadge {
	label: string;
	/** Shown on hover, and read by a screen reader after the label. */
	description: string;
}

/**
 * What `describePublishRefusal` turns a refused publish into. An app may add
 * its own keys (the problems told by field, a way to each one): `ErrorBox`
 * receives the whole object as `refusal`, so nothing has to be re-parsed
 * from `text`.
 */
export interface StudioPublishRefusal {
	/** The toast's text. */
	heading: string;
	/** The editor's error text, which `ErrorBox` receives as `message`. */
	text: string;
	[extra: string]: unknown;
}

/** What `ErrorBox` receives. */
export interface StudioErrorBoxProps {
	/** The editor's error text. */
	message: string;
	/**
	 * The refusal `describePublishRefusal` returned for this error, or null
	 * when the error is not a described refusal (a failed save, a conflict).
	 */
	refusal: StudioPublishRefusal | null;
}

/**
 * How the Studio lists one document type: the component that replaces the
 * list, and the words around it. Any part may be left out.
 */
export interface StudioDocumentList {
	/**
	 * Replaces the document list for the type. The list's header, search and
	 * paging stay cms-core's.
	 */
	component?: Component<StudioDocumentListProps>;
	/** The label of the create button, in place of the bare plus icon. */
	createLabel?: () => string;
	/** The hint the empty list shows, in place of the generic one. */
	emptyText?: () => string;
	/**
	 * Asks for the new document's title before creating it: the create button
	 * opens a one-line form in the list, and Enter opens the editor with the
	 * text already in `field` (`title` when true), so the document is stored
	 * with its title from the first save. Escape closes the form. `values`
	 * adds what else the new document starts with, derived from the title
	 * (a heading that repeats it).
	 */
	createWithTitle?:
		| boolean
		| { field?: string; values?: (title: string) => Record<string, unknown> };
	/**
	 * Actions the list's menu offers above its orderings (say, clearing out
	 * leftover drafts). The list re-reads its documents once one has run.
	 */
	actions?: () => readonly StudioListAction[];
}

/** One entry of a document list's menu (`StudioDocumentList.actions`). */
export interface StudioListAction {
	name: string;
	title: string;
	run: () => void | Promise<void>;
}

/** One document as the document list shows it. */
export interface StudioDocumentListRow {
	id: string;
	title: string;
	subtitle?: string;
	/** The document's `slug` field as stored, if it has one. */
	slug?: unknown;
	status: string;
	hasChanges: boolean;
	updatedAt: Date | null;
	/** Set on every row cms-core lists; optional for rows an app builds itself. */
	createdAt?: Date | null;
	/**
	 * True when no data of the document names it, so `title` is only its
	 * type's title: a list can call it untitled rather than "Page". Set on
	 * every row cms-core lists.
	 */
	untitled?: boolean;
	badge?: StudioListBadge | null;
}

export interface StudioDocumentListProps {
	rows: StudioDocumentListRow[];
	/** The id of the open document, if any. */
	activeId: string | null | undefined;
	onselect: (id: string) => void;
	/**
	 * Call after the list itself wrote a document (say, reordered it by
	 * dragging), as a tree calls its own: the rows are read again, and the
	 * editor re-reads the document when it is the one open, so its next save
	 * neither conflicts nor carries the old values back.
	 */
	onwritten: (id: string) => void;
	/** True when the signed-in user may not edit, as the editor reads it. */
	isReadOnly: boolean;
}

export interface StudioDocumentTreeProps {
	/** The type of the document open beside the tree, or the type whose list was opened. */
	activeType: string | null;
	/** The id of the document open beside the tree, if any. */
	activeId: string | null;
	/** Opens a document of any of the tree's types in the editor beside the tree. */
	onselect: (id: string, type: string) => void;
	/**
	 * Goes up by one on every write the editor beside the tree makes (autosave,
	 * publish, unpublish, restore, delete), so the tree can re-read the
	 * documents it shows.
	 */
	changes: number;
	/**
	 * Call after the tree itself wrote a document (moved, reordered or renamed
	 * it), so the editor re-reads it when it is the one open and its next
	 * save does not carry the old values back.
	 */
	onwritten: (id: string) => void;
	/** True when the signed-in user may not edit, as the editor reads it. */
	isReadOnly: boolean;
}

/**
 * A parent/child tree of several document types (say, menus, their sections
 * and their dishes) that takes the place of the document list for each of
 * them. Selecting a node opens that document in the ordinary editor beside
 * the tree, so the form is the schema's and only the hierarchy (order,
 * nesting, moving) is the app's.
 */
export interface StudioDocumentTree {
	/** The types the tree shows, the one the sidebar lists first. */
	types: readonly string[];
	/** Renders the tree. It reads and writes documents itself. */
	component: Component<StudioDocumentTreeProps>;
}

/**
 * An order the app works out itself, for an order no stored field holds
 * (say, the order a site's menu lists the documents in). Offered in the
 * list's sort menu above the schema's orderings.
 */
export interface StudioListOrdering {
	/** Unique among the type's orderings; must not end in `Asc` or `Desc`. */
	name: string;
	/** The menu entry's text, translated like a schema ordering's title. */
	title: string;
	/**
	 * Returns `rows` in this order. It receives every document of the type
	 * that matches the list's search, so paging follows the order.
	 */
	sort: (rows: readonly StudioDocumentListRow[]) => StudioDocumentListRow[];
}

/** How the document editor shows a schema's field groups. */
export interface StudioFieldGroups {
	/**
	 * `'buttons'` (the default): a row of filter buttons. `'tabs'`: a tab bar
	 * (`role="tablist"`), each tab with the number of fields it shows.
	 */
	style?: 'buttons' | 'tabs';
	/**
	 * False leaves out the "All fields" choice. The default group (or the
	 * first) opens, and a field in no shown group sits under the first tab.
	 * Defaults to true.
	 */
	allFields?: boolean;
}

export interface StudioExtensions {
	/** A badge beside a document's title in the document list. */
	listBadge?: (type: string, id: string) => StudioListBadge | null;
	/**
	 * Per document type, the list that replaces cms-core's and the words
	 * around it. A bare component is the list with the generic words.
	 */
	documentLists?: Readonly<Record<string, Component<StudioDocumentListProps> | StudioDocumentList>>;
	/**
	 * Trees that replace the whole document list pane (header, search and
	 * paging included) for every type they name. A type belongs to at most
	 * one tree; the first that names it wins.
	 */
	documentTrees?: readonly StudioDocumentTree[];
	/**
	 * Orders the app adds to a type's list. The first one is selected when
	 * the list for that type opens.
	 */
	listOrderings?: (type: string) => readonly StudioListOrdering[] | null;
	/**
	 * Turns the server's refusal of a publish (`ApiError.detail`) into the
	 * editor's error text, or returns null to show the refusal as it came.
	 */
	describePublishRefusal?: (
		detail: unknown,
		document: unknown,
		schema: { fields?: readonly Field[] } | null | undefined
	) => StudioPublishRefusal | null;
	/**
	 * Renders the document editor's error box in place of the plain message,
	 * with the described refusal beside the text when the error is one.
	 */
	ErrorBox?: Component<StudioErrorBoxProps>;
	/** The text of the error box under a field, in place of the rule engine's message. */
	fieldErrorText?: (message: string, field: Field, value: unknown) => string;
	/**
	 * The nonce for the inline script the Studio renders (the theme switch),
	 * for an app whose Content-Security-Policy forbids inline scripts. A
	 * function is called on every render, so an app can hand out the nonce
	 * of the current response (read from its request event) rather than one
	 * fixed string.
	 */
	scriptNonce?: string | (() => string | undefined);
	/**
	 * The order of the sidebar's document type groups, by group name. Groups
	 * not named keep their first-seen order after the named ones; ungrouped
	 * types always come first.
	 */
	groupOrder?: readonly string[];
	/** How the document editor shows field groups; filter buttons with "All fields" when left out. */
	fieldGroups?: StudioFieldGroups;
	/**
	 * When the editor shows a field's validation errors. `'always'` (the
	 * default) shows them whenever a check runs, on load and after every
	 * autosave. `'touched'` holds them back until the field was visited and
	 * left, its input reported it touched (`useFieldTouch`), a publish was
	 * attempted, or the document has been published before. Until then the
	 * Publish button stays enabled, so clicking it is what reveals them.
	 */
	fieldErrors?: 'always' | 'touched';
	/**
	 * How a field shows its description, the same in a document, a nested
	 * object, the object modal and an app's own panels: `'inline'` as a line
	 * under the label, `'tooltip'` behind an info icon beside it. Receives the
	 * mode the place asks for (`'tooltip'` inside an object, `'inline'`
	 * elsewhere), which stays when this is unset.
	 */
	fieldDescription?: (field: Field, requested: FieldDescriptionMode) => FieldDescriptionMode;
	/**
	 * The `input` a field without its own gets: an `aphex/field/component` key,
	 * so an app can draw every boolean (or every short list) with one widget of
	 * its own rather than naming it on each field. Return undefined for the
	 * built-in input; a key no part registers falls back to it too. Never
	 * asked for a `view` field, whose `input` names its slot.
	 */
	defaultInput?: (field: Field) => string | undefined;
	/**
	 * Called after the document editor published a document, with whether
	 * it was the document's first publish: an app can offer the next step
	 * (put a new page into a menu, announce it).
	 */
	afterPublish?: (published: StudioPublished) => void;
	/**
	 * Which entries the editor's document actions menu shows. Each returns
	 * false to leave its entry out for that document; unset, the entry shows
	 * wherever cms-core would show it (Duplicate: documents of a non-singleton
	 * type, for someone who may create one).
	 */
	documentActions?: {
		duplicate?: (document: StudioDocumentActionTarget) => boolean;
		inspect?: (document: StudioDocumentActionTarget) => boolean;
	};
	/**
	 * Shapes the values a copy starts with, after cms-core's own shaping
	 * (`duplicateValues`: title marked as a copy, slugs drawn again from it).
	 * Return the values to create the copy with: clear what must stay unique,
	 * drop what the copy must not inherit.
	 */
	prepareDuplicate?: (
		values: Record<string, unknown>,
		original: StudioDocumentActionTarget
	) => Record<string, unknown>;
}

/** The document a document action is asked about. */
export interface StudioDocumentActionTarget {
	type: string;
	id: string;
	schema: SchemaType;
	/** The document's draft values, without `_meta`. */
	values: Record<string, unknown>;
}

/** What `afterPublish` receives. */
export interface StudioPublished {
	type: string;
	id: string;
	/** True when the document had never been published before. */
	firstPublish: boolean;
	/** The published content, without `_meta`. */
	document: Record<string, unknown>;
}

/** Where a field's description shows: under its label, or behind an info icon. */
export type FieldDescriptionMode = 'inline' | 'tooltip';

let current: StudioExtensions = {};

export function configureStudio(extensions: StudioExtensions): void {
	current = extensions;
}

export function studioExtensions(): Readonly<StudioExtensions> {
	return current;
}

/** The nonce for this render of the Studio's inline script, if the app set one. */
export function studioScriptNonce(): string | undefined {
	const nonce = current.scriptNonce;
	return typeof nonce === 'function' ? nonce() : nonce;
}

/**
 * `groups` (as the sidebar buckets them, the ungrouped `null` bucket among
 * them) in the app's `groupOrder`: the ungrouped bucket first, then the named
 * groups in the order given, then the rest in the order they came.
 */
export function orderedGroups<Group extends { name: string | null }>(
	groups: readonly Group[],
	order: readonly string[] | undefined
): Group[] {
	if (!order?.length) return [...groups];
	const rank = (group: Group): number => {
		if (group.name === null) return -1;
		const index = order.indexOf(group.name);
		return index === -1 ? order.length : index;
	};
	// Array.prototype.sort is stable, so unranked groups keep their first-seen order.
	return [...groups].sort((a, b) => rank(a) - rank(b));
}

/**
 * The app's list for `type`, normalized: a bare component becomes
 * `{ component }`, and a type the app did not name gets an empty entry.
 */
export function studioDocumentList(type: string | null | undefined): StudioDocumentList {
	const entry = type ? current.documentLists?.[type] : undefined;
	if (!entry) return {};
	return typeof entry === 'function' ||
		!(
			'component' in entry ||
			'createLabel' in entry ||
			'emptyText' in entry ||
			'createWithTitle' in entry ||
			'actions' in entry
		)
		? { component: entry as Component<StudioDocumentListProps> }
		: (entry as StudioDocumentList);
}

/** The orderings `listOrderings` adds for `type`, none when it adds none. */
export function studioListOrderings(
	type: string | null | undefined
): readonly StudioListOrdering[] {
	return (type && current.listOrderings?.(type)) || [];
}

/**
 * One page of `rows` in `ordering`'s order, with the paging the list shows
 * for it: the rows are every document, so the app's order runs across
 * pages rather than inside each one.
 */
export function orderedListPage<Row extends StudioDocumentListRow>(
	rows: readonly Row[],
	ordering: StudioListOrdering,
	page: number,
	pageSize: number
): { rows: Row[]; total: number; totalPages: number } {
	const sorted = ordering.sort(rows) as Row[];
	const start = (page - 1) * pageSize;
	return {
		rows: sorted.slice(start, start + pageSize),
		total: sorted.length,
		totalPages: Math.max(1, Math.ceil(sorted.length / pageSize))
	};
}

/** The tree that shows `type`, or null when the type has its ordinary list. */
export function studioDocumentTree(type: string | null | undefined): StudioDocumentTree | null {
	if (!type) return null;
	return current.documentTrees?.find((tree) => tree.types.includes(type)) ?? null;
}

/** The field `createWithTitle` fills for `type`, or null when the list creates without asking. */
export function createTitleField(type: string | null | undefined): string | null {
	const ask = studioDocumentList(type).createWithTitle;
	if (!ask) return null;
	return ask === true ? 'title' : (ask.field ?? 'title');
}

/**
 * What a new document of `type` starts with when the list asked for
 * `title`: the title in its field, plus the list's `values` for it.
 */
export function createWithTitleValues(
	type: string | null | undefined,
	title: string
): Record<string, unknown> | null {
	const field = createTitleField(type);
	if (!field) return null;
	const ask = studioDocumentList(type).createWithTitle;
	const extra = typeof ask === 'object' ? (ask.values?.(title) ?? {}) : {};
	return { ...extra, [field]: title };
}

/** The actions `type`'s list menu offers, none when the app adds none. */
export function studioListActions(type: string | null | undefined): readonly StudioListAction[] {
	return studioDocumentList(type).actions?.() ?? [];
}

/**
 * The `input` key `field` is drawn with: its own, else the app's
 * `defaultInput` for it.
 */
export function fieldInputKey(field: Field): string | undefined {
	if (field.input) return field.input;
	if (field.type === 'view') return undefined;
	return current.defaultInput?.(field);
}

/** How `field` shows its description where the place asks for `requested`. */
export function fieldDescriptionMode(
	field: Field,
	requested: FieldDescriptionMode
): FieldDescriptionMode {
	return current.fieldDescription?.(field, requested) ?? requested;
}

/**
 * Whether the document actions menu offers `action` for `target`: the
 * app's `documentActions` hook when it set one, else true.
 */
export function studioDocumentActionShown(
	action: 'duplicate' | 'inspect',
	target: StudioDocumentActionTarget
): boolean {
	const decide = current.documentActions?.[action];
	return decide ? decide(target) : true;
}

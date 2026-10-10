// Hooks an app can hand the Studio to show its own text or components in a
// few places cms-core otherwise renders generically. Set once with
// `configureStudio` before the Studio renders. Plain TS (the Svelte imports
// are type-only), safe for the universal barrel.
import type { Component } from 'svelte';
import type { Field } from './types/schemas';

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
	badge?: StudioListBadge | null;
}

export interface StudioDocumentListProps {
	rows: StudioDocumentListRow[];
	/** The id of the open document, if any. */
	activeId: string | null | undefined;
	onselect: (id: string) => void;
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
}

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
		!('component' in entry || 'createLabel' in entry || 'emptyText' in entry)
		? { component: entry as Component<StudioDocumentListProps> }
		: (entry as StudioDocumentList);
}

/** The tree that shows `type`, or null when the type has its ordinary list. */
export function studioDocumentTree(type: string | null | undefined): StudioDocumentTree | null {
	if (!type) return null;
	return current.documentTrees?.find((tree) => tree.types.includes(type)) ?? null;
}

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

/** What `describePublishRefusal` turns a refused publish into. */
export interface StudioPublishRefusal {
	/** The toast's text. */
	heading: string;
	/** The editor's error text, which `ErrorBox` receives as `message`. */
	text: string;
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

export interface StudioExtensions {
	/** A badge beside a document's title in the document list. */
	listBadge?: (type: string, id: string) => StudioListBadge | null;
	/**
	 * A component that replaces the document list for a type. The list's
	 * header, search and paging stay cms-core's.
	 */
	documentLists?: Readonly<Record<string, Component<StudioDocumentListProps>>>;
	/**
	 * Orders the app adds to a type's list. The first one is selected when
	 * the list for that type opens.
	 */
	listOrderings?: (type: string) => readonly StudioListOrdering[] | null;
	/** The label of the create button for a type, in place of the bare plus icon. */
	createLabel?: (type: string) => string | null;
	/** The hint an empty document list shows for a type, in place of the generic one. */
	emptyListText?: (type: string) => string | null;
	/**
	 * Turns the server's refusal of a publish (`ApiError.detail`) into the
	 * editor's error text, or returns null to show the refusal as it came.
	 */
	describePublishRefusal?: (
		detail: unknown,
		document: unknown,
		schema: { fields?: readonly Field[] } | null | undefined
	) => StudioPublishRefusal | null;
	/** Renders the document editor's error box in place of the plain message. */
	ErrorBox?: Component<{ message: string }>;
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

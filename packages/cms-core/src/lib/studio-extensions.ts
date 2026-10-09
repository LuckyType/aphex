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

export interface StudioExtensions {
	/** A badge beside a document's title in the document list. */
	listBadge?: (type: string, id: string) => StudioListBadge | null;
	/**
	 * A component that replaces the document list for a type. The list's
	 * header, search and paging stay cms-core's.
	 */
	documentLists?: Readonly<Record<string, Component<StudioDocumentListProps>>>;
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
	 * for an app whose Content-Security-Policy forbids inline scripts.
	 */
	scriptNonce?: string;
}

let current: StudioExtensions = {};

export function configureStudio(extensions: StudioExtensions): void {
	current = extensions;
}

export function studioExtensions(): Readonly<StudioExtensions> {
	return current;
}

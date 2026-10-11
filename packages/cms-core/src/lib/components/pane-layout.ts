// Layout: editors take precedence. When space is tight, panels collapse
// to 60px strips — types first, then the docs list.
export const MIN_EDITOR_WIDTH = 650;
export const COLLAPSED_WIDTH = 60;
export const TYPES_WIDTH = 350;
export const DOCS_WIDTH = 350;

export interface PaneLayoutInput {
	/** The primary document editor is open. */
	editorOpen: boolean;
	/**
	 * A stacked reference editor is open as its own column. In presentation mode
	 * it isn't — it renders as an `absolute` overlay **inside** the primary
	 * editor's container so the live preview stays visible behind it. Counting
	 * it there made the two compete for the same width, and opening the version
	 * panel was enough to push `maxEditors` to 1. The expanded slot then went to
	 * the stacked editor, index 0 collapsed, and its container picked up
	 * `hidden` — taking the overlay nested inside it along with it.
	 */
	stackedColumn: boolean;
	/** 0 = primary editor, 1+ = stacked, -1 = types list, -2 = docs list. */
	activeEditorIndex: number;
	/** The documents list is drawn beside the editor. */
	hasDocs: boolean;
	/**
	 * The types column is drawn. A column that isn't rendered takes no width:
	 * reserving its 60px strip anyway (a single-type space hides it) was enough
	 * to tip a 1024px pane row under the editor's minimum and collapse the
	 * document list beside an open editor.
	 */
	typesShown: boolean;
	/** Width left for the panes, after anything else in the row (version panel). */
	available: number;
}

export interface PaneLayout {
	totalEditors: number;
	expandedCount: number;
	collapsedCount: number;
	typesCollapsed: boolean;
	docsCollapsed: boolean;
	expandedIndices: number[];
	activeIndex: number;
	typesExpanded: boolean;
	docsExpanded: boolean;
}

export function computePaneLayout(input: PaneLayoutInput): PaneLayout {
	const { activeEditorIndex, hasDocs, typesShown, available } = input;
	const totalEditors = (input.editorOpen ? 1 : 0) + (input.stackedColumn ? 1 : 0);

	if (totalEditors === 0) {
		return {
			totalEditors: 0,
			expandedCount: 0,
			collapsedCount: 0,
			typesCollapsed: false,
			docsCollapsed: false,
			expandedIndices: [],
			activeIndex: activeEditorIndex,
			typesExpanded: true,
			docsExpanded: true
		};
	}

	const validActiveIndex =
		activeEditorIndex < 0
			? activeEditorIndex
			: Math.max(0, Math.min(activeEditorIndex, totalEditors - 1));

	const typesActive = activeEditorIndex === -1;
	const docsActive = activeEditorIndex === -2;

	// Two editors open → always collapse both panels to maximize editing space
	// Unless user explicitly clicked a collapsed strip to expand it
	let typesExpanded = typesActive || totalEditors < 2;
	let docsExpanded = docsActive || totalEditors < 2;

	const panelsWidth = () =>
		(typesShown ? (typesExpanded ? TYPES_WIDTH : COLLAPSED_WIDTH) : 0) +
		(hasDocs ? (docsExpanded ? DOCS_WIDTH : COLLAPSED_WIDTH) : 0);
	let maxEditors = Math.floor((available - panelsWidth()) / MIN_EDITOR_WIDTH);

	// Reclaim space for the editor by collapsing the list panels. An open editor
	// is never the thing that gives way — a list losing 290px is recoverable in
	// one click, an editor squeezed under its minimum is unusable.
	//
	// Types goes first, then docs. Not depth order, which would take docs first:
	// depth is about how you got here, and what matters is what you still need
	// once you're here. While editing, the type list is the pane you're least
	// likely to want — you already know what you're editing, and switching type
	// is a rarer move than switching between documents of the same type, which
	// is the docs list's entire job.
	//
	// A panel the user explicitly expanded (by clicking its collapsed strip) is
	// never collapsed — an explicit click has to take effect. If the editor then
	// has no room, it becomes a strip instead and one click swaps them back;
	// every pane stays reachable.
	const reclaim = (collapseTypes: boolean, collapseDocs: boolean) => {
		if (maxEditors >= 1) return;
		if (collapseDocs && hasDocs) docsExpanded = false;
		if (collapseTypes) typesExpanded = false;
		maxEditors = Math.floor((available - panelsWidth()) / MIN_EDITOR_WIDTH);
	};

	reclaim(!typesActive, false); // types, unless the user just opened it
	reclaim(false, !docsActive); // then docs, unless the user just opened it

	// Neither list was explicitly opened, so there is no click to honour —
	// collapse them regardless rather than leave the editor unusable.
	if (!typesActive && !docsActive) {
		reclaim(true, false);
		reclaim(false, true);
	}

	// MIN_EDITOR_WIDTH is what the editor *wants*, not a floor it must clear to
	// be shown. If the lists couldn't be collapsed any further (the user
	// explicitly opened one), the editor simply takes what's left — a narrow
	// editor still beats a 60px strip sitting next to unused space.
	if (maxEditors < 1) maxEditors = 1;

	// Build expanded editor indices, prioritizing active + most recent.
	// A negative `validActiveIndex` means a *list* panel holds focus (-1 types,
	// -2 docs), not an editor. Seeding the array with it left no editor in the
	// expanded set at all, so clicking the document list collapsed the open
	// editor to a 60px strip. Fall back to the deepest editor so one is always
	// expanded.
	const primaryIndex = validActiveIndex >= 0 ? validActiveIndex : totalEditors - 1;
	const expandedIndices: number[] = [primaryIndex];
	if (maxEditors > 1) {
		for (let i = totalEditors - 1; i >= 0 && expandedIndices.length < maxEditors; i--) {
			if (i !== primaryIndex) expandedIndices.push(i);
		}
	}

	return {
		totalEditors,
		expandedCount: expandedIndices.length,
		collapsedCount: totalEditors - expandedIndices.length,
		typesCollapsed: !typesExpanded,
		docsCollapsed: !docsExpanded,
		expandedIndices,
		activeIndex: validActiveIndex,
		typesExpanded,
		docsExpanded
	};
}

import { getContext, setContext, untrack } from 'svelte';

const EDITOR_TRAIL_KEY = Symbol.for('aphex.admin.editor-trail');

/**
 * One step of the way to what the editor shows: the document list, the
 * document, or a panel a field opened inside it (an array item, an item
 * inside that one).
 */
export interface EditorCrumb {
	label: string;
	/** A longer name, shown as the crumb's tooltip (an item's own title beside its type). */
	title?: string;
	/**
	 * Goes to this step. Leave it out on the step a panel already shows: going
	 * to it only closes what was opened from it.
	 */
	select?: () => void;
}

/**
 * What an input reports while it shows a panel: the steps from the document
 * down to the item in the panel, and how to close the panel. An input that
 * opens an item three levels down directly reports all three steps.
 */
export interface EditorTrailEntry {
	crumbs: EditorCrumb[];
	close: () => void;
}

/** An input's place in the trail. */
export interface EditorTrailHandle {
	/** Reports the panel's steps, or null once it is closed. */
	set(entry: EditorTrailEntry | null): void;
}

interface Placed {
	id: number;
	entry: EditorTrailEntry;
}

/**
 * The way from the document list to the panel in view, shared by the
 * editor's breadcrumbs and every input that opens a panel. The editor names
 * the `root` (list and document); inputs add their panels in the order they
 * open, so a panel opened from inside another one follows it.
 */
export class EditorTrail {
	#root: () => EditorCrumb[];
	#entries = $state.raw<Placed[]>([]);
	#next = 0;

	constructor(root: () => EditorCrumb[] = () => []) {
		this.#root = root;
	}

	/** The steps above any panel: the document list and the document. */
	get root(): EditorCrumb[] {
		return this.#root();
	}

	/** The steps of the open panels, below the root. */
	get panels(): EditorCrumb[] {
		return this.#entries.flatMap(({ id, entry }) =>
			entry.crumbs.map((crumb) => ({
				...crumb,
				select: () => {
					this.#closeAfter(id);
					crumb.select?.();
				}
			}))
		);
	}

	/** Every step, list first and the panel in view last. */
	get crumbs(): EditorCrumb[] {
		return [...this.root, ...this.panels];
	}

	/** Whether a panel is open, so there is a level to go up to inside the document. */
	get open(): boolean {
		return this.#entries.length > 0;
	}

	register(): EditorTrailHandle {
		const id = this.#next++;
		return {
			// Called from an input's effect, which must not come to depend on
			// the trail it writes.
			set: (entry) =>
				untrack(() => {
					const entries = this.#entries;
					const at = entries.findIndex((placed) => placed.id === id);
					if (entry === null) {
						if (at >= 0) this.#entries = entries.filter((placed) => placed.id !== id);
					} else if (at >= 0) {
						this.#entries = entries.map((placed) => (placed.id === id ? { id, entry } : placed));
					} else {
						this.#entries = [...entries, { id, entry }];
					}
				})
		};
	}

	/** Goes one level up: to the step above the panel in view, or out of the last panel. */
	up(): boolean {
		const panels = this.panels;
		if (panels.length === 0) return false;
		if (panels.length === 1) this.closeAll();
		else panels.at(-2)?.select?.();
		return true;
	}

	/** Closes every panel, innermost first, back to the document. */
	closeAll(): void {
		this.#closeAfter(-1);
	}

	#closeAfter(id: number): void {
		const later = this.#entries.filter((placed) => placed.id > id);
		for (const placed of later.reverse()) placed.entry.close();
	}
}

export function setEditorTrail(trail: EditorTrail): void {
	setContext(EDITOR_TRAIL_KEY, trail);
}

export function getEditorTrail(): EditorTrail | null {
	return getContext<EditorTrail>(EDITOR_TRAIL_KEY) ?? null;
}

/**
 * For a custom input that edits an item in a panel of its own: returns its
 * place in the editor's trail, so the breadcrumbs name the panel and the
 * back arrow goes up one level at a time. Outside an editor it does
 * nothing. Call during component setup, and report null once the panel
 * closes (and on destroy).
 */
export function useEditorTrail(): EditorTrailHandle {
	return getEditorTrail()?.register() ?? { set: () => {} };
}

/** A crumb, or the place of the crumbs folded away. */
export type ShownCrumb =
	| { kind: 'crumb'; crumb: EditorCrumb; index: number }
	| { kind: 'more'; crumbs: EditorCrumb[] };

/**
 * The crumbs shown when `hidden` of them do not fit: the first `keep` and
 * the last always show, and the ones folded away are taken from the middle,
 * nearest the start first, so the way just above the item in view stays.
 */
export function middleCut(crumbs: EditorCrumb[], hidden: number, keep = 2): ShownCrumb[] {
	const room = Math.max(0, crumbs.length - keep - 1);
	const cut = Math.min(Math.max(0, hidden), room);
	const shown: ShownCrumb[] = crumbs.map((crumb, index) => ({ kind: 'crumb', crumb, index }));
	if (cut === 0) return shown;
	return [
		...shown.slice(0, keep),
		{ kind: 'more', crumbs: crumbs.slice(keep, keep + cut) },
		...shown.slice(keep + cut)
	];
}

/** How many crumbs `middleCut` can fold away at most. */
export function foldable(count: number, keep = 2): number {
	return Math.max(0, count - keep - 1);
}

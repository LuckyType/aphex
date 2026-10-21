import { getContext, setContext } from 'svelte';

const SAVE_STATE_KEY = Symbol('aphex-save-state');

export interface SaveState {
	readonly saving: boolean;
	readonly hasUnsavedChanges: boolean;
	readonly savedAgoText: string | null;
	/** Whether the document has been published before, so its URL may be in use. */
	readonly published?: boolean;
}

export function setSaveStateContext(state: SaveState) {
	setContext(SAVE_STATE_KEY, state);
}

export function getSaveStateContext(): SaveState | null {
	return getContext<SaveState>(SAVE_STATE_KEY) ?? null;
}

/**
 * Whether a stored document (its `_meta`) has been published before: it is
 * published now, or was and has been unpublished.
 */
export function hasBeenPublished(
	meta: { status?: string | null; publishedAt?: unknown } | null | undefined
): boolean {
	return (
		meta?.publishedAt != null || meta?.status === 'published' || meta?.status === 'unpublished'
	);
}

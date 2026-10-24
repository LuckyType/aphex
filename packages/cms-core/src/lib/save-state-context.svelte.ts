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

/**
 * Why a document's schedule button is disabled, or null while it is enabled.
 * A publish held up by shown errors is `'errors'`: the document has plenty to
 * publish, so telling the editor there is nothing to publish sends them to make
 * a change when they should fix a field.
 */
export function scheduleBlockedReason(state: {
	enabled: boolean;
	action: 'publish' | 'unpublish';
	saving: boolean;
	hasChanges: boolean;
	hasErrors: boolean;
}): 'saving' | 'errors' | 'nothing' | null {
	if (state.enabled) return null;
	if (state.saving) return 'saving';
	if (state.action === 'publish' && state.hasChanges && state.hasErrors) return 'errors';
	return 'nothing';
}

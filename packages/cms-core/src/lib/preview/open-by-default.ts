/** The narrowest window that shows the Present button (Tailwind's `lg`). */
export const PRESENT_MIN_WIDTH = 1024;

/**
 * Whether the editor should open in presentation mode for this schema: it
 * asks for it with `previewOpenByDefault`, has a `previewUrl` to show, and
 * the window is wide enough for the split. Read once per opened document,
 * so closing the preview sticks until another document opens.
 */
export function opensPreviewByDefault(
	schema: { previewUrl?: unknown; previewOpenByDefault?: boolean } | undefined,
	windowWidth: number
): boolean {
	return !!schema?.previewOpenByDefault && !!schema.previewUrl && windowWidth >= PRESENT_MIN_WIDTH;
}

const REMEMBERED_PREVIEW_KEY = 'aphex:preview-open';

/**
 * The preview choice last made for documents of `type` in this browser:
 * true (open), false (closed) or null when none was made. Storage that is
 * missing or blocked reads as no choice.
 */
export function rememberedPreview(type: string, storage = browserStorage()): boolean | null {
	try {
		const choices = JSON.parse(storage?.getItem(REMEMBERED_PREVIEW_KEY) ?? '{}');
		const choice = choices?.[type];
		return typeof choice === 'boolean' ? choice : null;
	} catch {
		return null;
	}
}

/** Keeps `open` as the preview choice for documents of `type` in this browser. */
export function rememberPreview(type: string, open: boolean, storage = browserStorage()): void {
	try {
		if (!storage) return;
		const choices = JSON.parse(storage.getItem(REMEMBERED_PREVIEW_KEY) ?? '{}');
		storage.setItem(
			REMEMBERED_PREVIEW_KEY,
			JSON.stringify({ ...(choices && typeof choices === 'object' ? choices : {}), [type]: open })
		);
	} catch {
		// Blocked storage: the choice lasts until the page reloads.
	}
}

/**
 * Whether a document of this schema opens with the preview: the choice last
 * made for its type when there is one, else `previewOpenByDefault`. Either
 * way only with a `previewUrl` and a window wide enough for the split.
 */
export function opensPreview(
	schema: { previewUrl?: unknown; previewOpenByDefault?: boolean } | undefined,
	windowWidth: number,
	remembered: boolean | null
): boolean {
	if (remembered === null) return opensPreviewByDefault(schema, windowWidth);
	return remembered && !!schema?.previewUrl && windowWidth >= PRESENT_MIN_WIDTH;
}

function browserStorage(): Storage | undefined {
	try {
		return typeof localStorage === 'undefined' ? undefined : localStorage;
	} catch {
		return undefined;
	}
}

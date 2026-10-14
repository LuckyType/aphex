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

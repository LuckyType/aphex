import type { Editor } from '@tiptap/core';
/**
 * A registered richtext editor plus the imperative hooks DocumentEditor needs for
 * click-to-edit — e.g. opening the link popover after dropping the caret in a link,
 * rather than relying on the editor's transaction heuristic to notice the selection move.
 */
export interface RichtextEditorHandle {
    editor: Editor;
    /** Open the link action popover for the link at the current selection. */
    openLinkPopover: () => void;
}
type EditorRegistry = Map<string, RichtextEditorHandle>;
/** Call once in DocumentEditor to create the registry. */
export declare function setRichtextEditorRegistry(): EditorRegistry;
/** Call in RichtextField to register/unregister the editor handle. */
export declare function getRichtextEditorRegistry(): EditorRegistry | null;
export {};
//# sourceMappingURL=richtext-context.svelte.d.ts.map
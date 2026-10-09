import type { NodeViewRendererProps } from '@tiptap/core';
import type { NodeView as ProseMirrorNodeView } from '@tiptap/pm/view';
import type { Component } from 'svelte';
import type { PreviewSource } from '../../../../utils/preview.js';
import type { BlockPreviewProps } from '../../../../admin/block-previews.svelte.js';
export declare function SvelteNodeViewRenderer(onEdit: (attrs: {
    _type: string;
    _key: string;
    data: Record<string, unknown>;
}) => void, onDelete: (key: string) => void, 
/**
 * Look up a block type's schema (its entry in the field's `of`) so the card can
 * honour that type's `preview` config instead of guessing a title/subtitle from
 * the raw data. Optional — without it the card falls back to the old heuristic.
 */
resolveSchema?: (type: string) => PreviewSource, 
/**
 * Resolve a custom preview component for a block type. When one exists it's mounted
 * instead of the generic card, so the author sees the real block inline. It receives
 * the same props (including `onEdit`/`onDelete`), so editing still works.
 */
resolveComponent?: (type: string) => Component<BlockPreviewProps> | undefined): (props: NodeViewRendererProps) => ProseMirrorNodeView;
//# sourceMappingURL=svelte-node-view.d.ts.map
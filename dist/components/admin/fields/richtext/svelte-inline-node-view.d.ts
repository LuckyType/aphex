import type { NodeViewRendererProps } from '@tiptap/core';
import type { NodeView as ProseMirrorNodeView } from '@tiptap/pm/view';
export declare function SvelteInlineNodeViewRenderer(onEdit: (attrs: {
    _type: string;
    _key: string;
    data: Record<string, unknown>;
}) => void, onDelete: (key: string) => void): (props: NodeViewRendererProps) => ProseMirrorNodeView;
//# sourceMappingURL=svelte-inline-node-view.d.ts.map
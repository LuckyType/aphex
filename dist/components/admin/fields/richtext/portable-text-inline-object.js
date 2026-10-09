import { Node, mergeAttributes } from '@tiptap/core';
import { SvelteInlineNodeViewRenderer } from './svelte-inline-node-view.js';
export const PortableTextInlineObject = Node.create({
    name: 'portableTextInlineObject',
    group: 'inline',
    inline: true,
    atom: true,
    selectable: true,
    addOptions() {
        return {
            onEdit: () => { },
            onDelete: () => { }
        };
    },
    addAttributes() {
        return {
            _type: { default: null },
            _key: { default: null },
            data: { default: {} }
        };
    },
    parseHTML() {
        return [{ tag: 'span[data-portable-text-inline]' }];
    },
    renderHTML({ HTMLAttributes }) {
        return ['span', mergeAttributes(HTMLAttributes, { 'data-portable-text-inline': '' }), 0];
    },
    addNodeView() {
        return SvelteInlineNodeViewRenderer(this.options.onEdit, this.options.onDelete);
    }
});

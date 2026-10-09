import { Node, mergeAttributes } from '@tiptap/core';
import { SvelteNodeViewRenderer } from './svelte-node-view.js';
export const PortableTextObject = Node.create({
    name: 'portableTextObject',
    group: 'block',
    atom: true,
    draggable: true,
    selectable: true,
    addOptions() {
        return {
            onEdit: () => { },
            onDelete: () => { },
            resolveSchema: undefined,
            resolveComponent: undefined
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
        return [{ tag: 'div[data-portable-text-object]' }];
    },
    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-portable-text-object': '' }), 0];
    },
    addNodeView() {
        return SvelteNodeViewRenderer(this.options.onEdit, this.options.onDelete, this.options.resolveSchema, this.options.resolveComponent);
    }
});

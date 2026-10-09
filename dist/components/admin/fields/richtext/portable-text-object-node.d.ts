import { Node } from '@tiptap/core';
import type { Component } from 'svelte';
import type { PreviewSource } from '../../../../utils/preview.js';
import type { BlockPreviewProps } from '../../../../admin/block-previews.svelte.js';
export interface PortableTextObjectOptions {
    onEdit: (attrs: {
        _type: string;
        _key: string;
        data: Record<string, unknown>;
    }) => void;
    onDelete: (key: string) => void;
    /** Resolve a block type's schema so its card can honour the type's `preview` config. */
    resolveSchema?: (type: string) => PreviewSource;
    /** Resolve a custom preview component, rendered inline instead of the generic card. */
    resolveComponent?: (type: string) => Component<BlockPreviewProps> | undefined;
}
export declare const PortableTextObject: Node<PortableTextObjectOptions, any>;
//# sourceMappingURL=portable-text-object-node.d.ts.map
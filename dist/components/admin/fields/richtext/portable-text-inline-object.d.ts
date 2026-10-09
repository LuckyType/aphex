import { Node } from '@tiptap/core';
export interface PortableTextInlineObjectOptions {
    onEdit: (attrs: {
        _type: string;
        _key: string;
        data: Record<string, unknown>;
    }) => void;
    onDelete: (key: string) => void;
}
export declare const PortableTextInlineObject: Node<PortableTextInlineObjectOptions, any>;
//# sourceMappingURL=portable-text-inline-object.d.ts.map
import type { JSONContent } from '@tiptap/core';
interface PortableTextSpan {
    _type: 'span';
    _key: string;
    text: string;
    marks?: string[];
}
export interface PortableTextInlineObject {
    _type: string;
    _key: string;
    [key: string]: unknown;
}
export type PortableTextChild = PortableTextSpan | PortableTextInlineObject;
interface PortableTextMarkDefinition {
    _type: string;
    _key: string;
    [key: string]: unknown;
}
interface PortableTextBlock {
    _type: 'block';
    _key: string;
    style?: string;
    children: PortableTextChild[];
    markDefs?: PortableTextMarkDefinition[];
    listItem?: string;
    level?: number;
}
export interface PortableTextCustomBlock {
    _type: string;
    _key: string;
    [key: string]: unknown;
}
export type PortableTextNode = PortableTextBlock | PortableTextCustomBlock;
export type PortableTextValue = PortableTextNode[];
export declare function tiptapToPortableText(doc: JSONContent): PortableTextValue;
export declare function portableTextToTiptap(value: PortableTextValue): JSONContent;
export {};
//# sourceMappingURL=portable-text-serializer.d.ts.map
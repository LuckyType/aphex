import { Mark } from '@tiptap/core';
export interface CustomAnnotationOptions {
    annotationType: string;
    onEdit: (attrs: Record<string, unknown>) => void;
}
export declare function createAnnotationMark(name: string): Mark<CustomAnnotationOptions, any>;
//# sourceMappingURL=custom-annotation-mark.d.ts.map
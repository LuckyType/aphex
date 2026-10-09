import type { Field } from '../../../types/schemas.js';
type ReferenceValue = {
    _type: 'reference';
    _ref: string;
    _key?: string;
};
interface Props {
    field: Field;
    value: ReferenceValue | null;
    onUpdate: (value: ReferenceValue | null) => void;
    onOpenReference?: (documentId: string, documentType: string) => void;
    readonly?: boolean;
    onRemove?: () => void;
    preloadedDoc?: unknown;
}
declare const ReferenceField: import("svelte").Component<Props, {}, "">;
type ReferenceField = ReturnType<typeof ReferenceField>;
export default ReferenceField;
//# sourceMappingURL=ReferenceField.svelte.d.ts.map
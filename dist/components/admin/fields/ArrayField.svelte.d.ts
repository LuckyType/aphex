import type { ArrayField as ArrayFieldType } from '../../../types/schemas.js';
interface Props {
    field: ArrayFieldType;
    value: any;
    onUpdate: (value: any) => void;
    onOpenReference?: (documentId: string, documentType: string) => void;
    readonly?: boolean;
    organizationId?: string;
    /**
     * The document this array belongs to, forwarded to the modals that edit items.
     * An item's own value is the sibling scope for its fields; this is the root
     * fallback, so a dependent list inside an item can still name a document-level
     * field. Previously nothing was passed here at all, which is why `dependsOn`
     * never resolved anywhere inside an array.
     */
    documentData?: Record<string, any>;
}
declare const ArrayField: import("svelte").Component<Props, {}, "">;
type ArrayField = ReturnType<typeof ArrayField>;
export default ArrayField;
//# sourceMappingURL=ArrayField.svelte.d.ts.map
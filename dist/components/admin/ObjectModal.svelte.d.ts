import type { SchemaType } from '../../types/schemas.js';
interface Props {
    open: boolean;
    schema: SchemaType;
    value: Record<string, any>;
    onClose: () => void;
    onUpdate: (value: Record<string, any>) => void;
    onOpenReference?: (documentId: string, documentType: string) => void;
    readonly?: boolean;
    organizationId?: string;
    /**
     * The document the edited object belongs to. `value` is the sibling scope for
     * the object's own fields; this is the root fallback, so a `dependsOn` may name
     * either a field of the object or a field of the document.
     */
    documentData?: Record<string, any>;
}
declare const ObjectModal: import("svelte").Component<Props, {}, "">;
type ObjectModal = ReturnType<typeof ObjectModal>;
export default ObjectModal;
//# sourceMappingURL=ObjectModal.svelte.d.ts.map
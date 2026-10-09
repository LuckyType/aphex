import type { Field } from '../../../types/schemas.js';
interface Props {
    field: Field;
    value: any;
    onUpdate: (value: any) => void;
    readonly?: boolean;
    validationClasses?: string;
    documentData?: Record<string, any>;
    /** The object scope this field lives in — see StringField's `siblingData`. */
    siblingData?: Record<string, any>;
    schemaType?: string;
    fieldPath?: string;
    organizationId?: string;
    onOpenReference?: (documentId: string, documentType: string) => void;
}
declare const FieldInput: import("svelte").Component<Props, {}, "">;
type FieldInput = ReturnType<typeof FieldInput>;
export default FieldInput;
//# sourceMappingURL=FieldInput.svelte.d.ts.map
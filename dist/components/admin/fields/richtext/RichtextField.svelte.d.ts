import { type PortableTextValue } from './portable-text-serializer.js';
import type { ArrayField as ArrayFieldType } from '../../../../types/schemas.js';
interface Props {
    field: ArrayFieldType;
    value: PortableTextValue | null | undefined;
    onUpdate: (value: PortableTextValue) => void;
    validationClasses?: string;
    readonly?: boolean;
    onOpenReference?: (documentId: string, documentType: string) => void;
    organizationId?: string;
    /** Forwarded to the block/annotation modals as the root scope for `dependsOn`. */
    documentData?: Record<string, any>;
}
declare const RichtextField: import("svelte").Component<Props, {}, "">;
type RichtextField = ReturnType<typeof RichtextField>;
export default RichtextField;
//# sourceMappingURL=RichtextField.svelte.d.ts.map
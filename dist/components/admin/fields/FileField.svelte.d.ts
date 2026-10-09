import type { FileValue } from '../../../types/asset.js';
import type { FileField as FileFieldType } from '../../../types/schemas.js';
interface Props {
    field: FileFieldType;
    value: FileValue | null;
    validationClasses?: string;
    onUpdate: (value: FileValue | null) => void;
    schemaType?: string;
    fieldPath?: string;
    readonly?: boolean;
    compact?: boolean;
    arrayItem?: boolean;
    organizationId?: string;
}
declare const FileField: import("svelte").Component<Props, {}, "">;
type FileField = ReturnType<typeof FileField>;
export default FileField;
//# sourceMappingURL=FileField.svelte.d.ts.map
import type { ImageValue } from '../../../types/asset.js';
import type { ImageField as ImageFieldType } from '../../../types/schemas.js';
interface Props {
    field: ImageFieldType;
    value: ImageValue | null;
    validationClasses?: string;
    onUpdate: (value: ImageValue | null) => void;
    schemaType?: string;
    fieldPath?: string;
    readonly?: boolean;
    compact?: boolean;
    arrayItem?: boolean;
    organizationId?: string;
}
declare const ImageField: import("svelte").Component<Props, {}, "">;
type ImageField = ReturnType<typeof ImageField>;
export default ImageField;
//# sourceMappingURL=ImageField.svelte.d.ts.map
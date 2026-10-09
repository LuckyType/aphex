import type { Field } from '../../../types/schemas.js';
interface Props {
    field: Field;
    value: any;
    onUpdate: (value: any) => void;
    validationClasses?: string;
    onBlur?: (event: any) => void;
    readonly?: boolean;
}
declare const BooleanField: import("svelte").Component<Props, {}, "">;
type BooleanField = ReturnType<typeof BooleanField>;
export default BooleanField;
//# sourceMappingURL=BooleanField.svelte.d.ts.map
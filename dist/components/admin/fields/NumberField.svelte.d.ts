import type { NumberField } from '../../../types/schemas.js';
interface Props {
    field: NumberField;
    value: number | null;
    onUpdate: (value: number | null) => void;
    validationClasses?: string;
    onBlur?: (event: any) => void;
    onFocus?: (event: any) => void;
    readonly?: boolean;
}
declare const NumberField: import("svelte").Component<Props, {}, "">;
type NumberField = ReturnType<typeof NumberField>;
export default NumberField;
//# sourceMappingURL=NumberField.svelte.d.ts.map
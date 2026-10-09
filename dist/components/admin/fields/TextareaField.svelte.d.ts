import type { TextField } from '../../../types/schemas.js';
interface Props {
    field: TextField;
    value: any;
    onUpdate: (value: any) => void;
    validationClasses?: string;
    onBlur?: (event: any) => void;
    onFocus?: (event: any) => void;
    readonly?: boolean;
}
declare const TextareaField: import("svelte").Component<Props, {}, "">;
type TextareaField = ReturnType<typeof TextareaField>;
export default TextareaField;
//# sourceMappingURL=TextareaField.svelte.d.ts.map
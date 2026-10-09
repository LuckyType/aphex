import type { DateTimeField } from '../../../types/schemas.js';
interface Props {
    field: DateTimeField;
    value: string | null;
    onUpdate: (value: string | null) => void;
    validationClasses?: string;
    onBlur?: (event: any) => void;
    onFocus?: (event: any) => void;
    readonly?: boolean;
}
declare const DateTimeField: import("svelte").Component<Props, {}, "">;
type DateTimeField = ReturnType<typeof DateTimeField>;
export default DateTimeField;
//# sourceMappingURL=DateTimeField.svelte.d.ts.map
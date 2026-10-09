import type { DateField } from '../../../types/schemas.js';
interface Props {
    field: DateField;
    value: string | null;
    onUpdate: (value: string | null) => void;
    validationClasses?: string;
    onBlur?: (event: any) => void;
    onFocus?: (event: any) => void;
    readonly?: boolean;
}
declare const DateField: import("svelte").Component<Props, {}, "">;
type DateField = ReturnType<typeof DateField>;
export default DateField;
//# sourceMappingURL=DateField.svelte.d.ts.map
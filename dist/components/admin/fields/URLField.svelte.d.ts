import type { URLField } from '../../../types/schemas.js';
interface Props {
    field: URLField;
    value: any;
    onUpdate: (value: any) => void;
    validationClasses?: string;
    onBlur?: (event: any) => void;
    onFocus?: (event: any) => void;
    readonly?: boolean;
}
declare const URLField: import("svelte").Component<Props, {}, "">;
type URLField = ReturnType<typeof URLField>;
export default URLField;
//# sourceMappingURL=URLField.svelte.d.ts.map
import type { SlugField } from '../../../types/schemas.js';
interface Props {
    field: SlugField;
    value: any;
    /** The whole document — where a root-level `source` field is found. */
    documentData?: Record<string, any>;
    /** The object this field lives in; `source`, like `dependsOn`, names a sibling. */
    siblingData?: Record<string, any>;
    onUpdate: (value: any) => void;
    validationClasses?: string;
    onBlur?: (event: any) => void;
    onFocus?: (event: any) => void;
    readonly?: boolean;
}
declare const SlugField: import("svelte").Component<Props, {}, "">;
type SlugField = ReturnType<typeof SlugField>;
export default SlugField;
//# sourceMappingURL=SlugField.svelte.d.ts.map
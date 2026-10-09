import type { StringField } from '../../../types/schemas.js';
interface Props {
    field: StringField;
    value: any;
    /** The whole document. Root-level fields of a `dependsOn` resolve here. */
    documentData?: Record<string, any>;
    /**
     * The object this field actually lives in — the array item, or the inline
     * object — which for a root-level field is just the document again.
     *
     * Separate from `documentData` because `dependsOn` names a *sibling*, and a
     * field nested in an object or array item has no siblings at the root. That
     * lookup used to be root-only, so a dependent list inside a page-builder
     * block could never see the field it depended on and rendered permanently
     * empty.
     */
    siblingData?: Record<string, any>;
    onUpdate: (value: any) => void;
    validationClasses?: string;
    onBlur?: (event: any) => void;
    onFocus?: (event: any) => void;
    readonly?: boolean;
}
declare const StringField: import("svelte").Component<Props, {}, "">;
type StringField = ReturnType<typeof StringField>;
export default StringField;
//# sourceMappingURL=StringField.svelte.d.ts.map
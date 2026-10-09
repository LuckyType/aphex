import type { Field } from '../../types/schemas.js';
import SchemaField from './SchemaField.svelte';
interface Props {
    field: Field;
    value: any;
    /** The whole document. Stays the document all the way down the tree. */
    documentData?: Record<string, any>;
    /**
     * The object this field is a member of — the document at the top level, the
     * object's own value inside an inline object, the item's value inside an array
     * item. `dependsOn` and a slug's `source` name siblings, so they resolve here
     * first and fall back to `documentData`.
     *
     * Defaults to `documentData`, which makes the root case a no-op for callers.
     */
    siblingData?: Record<string, any>;
    onUpdate: (value: any) => void;
    onOpenReference?: (documentId: string, documentType: string) => void;
    doValidation?: () => void;
    schemaType?: string;
    parentPath?: string;
    readonly?: boolean;
    organizationId?: string;
    /**
     * How to present `field.description`. `'inline'` (default) shows it as a line
     * under the label; `'tooltip'` shows an info icon that reveals it on hover/focus.
     * Object containers pass `'tooltip'` to their subfields so nested groups don't
     * become a wall of help text.
     */
    descriptionMode?: 'inline' | 'tooltip';
}
declare const SchemaField: import("svelte").Component<Props, {
    performValidation: (currentValue: any) => Promise<void>;
}, "">;
type SchemaField = ReturnType<typeof SchemaField>;
export default SchemaField;
//# sourceMappingURL=SchemaField.svelte.d.ts.map
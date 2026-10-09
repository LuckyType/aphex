/**
 * Field-input widget registry (client-side context).
 *
 * Plugins contribute custom input widgets via `aphex/field/component` parts, keyed
 * by an `input` string. A field opts into one with `{ …, input: 'color' }`.
 * The admin shell publishes a lookup here; SchemaField (however deeply nested)
 * resolves the widget and renders it in place of the built-in for that field type.
 */
import { type Component } from 'svelte';
import type { FieldComponentProps } from '../plugins/types.js';
export type FieldComponentLookup = (input: string) => Component<FieldComponentProps> | undefined;
/** Publish the widget lookup to descendants (call in the admin shell). */
export declare function setFieldComponents(lookup: FieldComponentLookup): void;
/** Resolve the widget lookup. Returns a no-op lookup outside the admin shell. */
export declare function useFieldComponents(): FieldComponentLookup;
//# sourceMappingURL=field-components.svelte.d.ts.map
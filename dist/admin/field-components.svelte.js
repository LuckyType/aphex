/**
 * Field-input widget registry (client-side context).
 *
 * Plugins contribute custom input widgets via `aphex/field/component` parts, keyed
 * by an `input` string. A field opts into one with `{ …, input: 'color' }`.
 * The admin shell publishes a lookup here; SchemaField (however deeply nested)
 * resolves the widget and renders it in place of the built-in for that field type.
 */
import { getContext, setContext } from 'svelte';
const FIELD_COMPONENTS_KEY = Symbol.for('aphex.admin.field-components');
/** Publish the widget lookup to descendants (call in the admin shell). */
export function setFieldComponents(lookup) {
    setContext(FIELD_COMPONENTS_KEY, lookup);
}
/** Resolve the widget lookup. Returns a no-op lookup outside the admin shell. */
export function useFieldComponents() {
    return getContext(FIELD_COMPONENTS_KEY) ?? (() => undefined);
}

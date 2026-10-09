import { getContext, setContext } from 'svelte';
const KEY = Symbol('aphex:richtext-editors');
/** Call once in DocumentEditor to create the registry. */
export function setRichtextEditorRegistry() {
    const registry = new Map();
    setContext(KEY, registry);
    return registry;
}
/** Call in RichtextField to register/unregister the editor handle. */
export function getRichtextEditorRegistry() {
    return getContext(KEY) ?? null;
}

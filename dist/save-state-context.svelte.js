import { getContext, setContext } from 'svelte';
const SAVE_STATE_KEY = Symbol('aphex-save-state');
export function setSaveStateContext(state) {
    setContext(SAVE_STATE_KEY, state);
}
export function getSaveStateContext() {
    return getContext(SAVE_STATE_KEY) ?? null;
}

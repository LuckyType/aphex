/**
 * Admin slot registry — the extension-point primitive for the admin shell.
 *
 * Named regions ("slots") in the admin chrome that any component can render UI
 * into at runtime, without the shell knowing who the contributor is and without
 * anyone patching AdminApp/Sidebar directly. This is the client-side half of the
 * plugin system's "extension slots" (see references/PLUGIN_SYSTEM_PLAN.md §4):
 * registration happens in the browser via context + snippets, never through
 * SvelteKit `load` (load data must stay serializable — components can't cross it).
 *
 * Today's first consumer is the document editor, which registers its toolbar into
 * the `navbar-start` / `navbar-end` slots so its controls live in the single top
 * bar. Tomorrow, plugin document-actions and admin tools register the same way.
 *
 * Usage:
 *   // shell (once, high in the tree)
 *   const slots = setAdminSlots();
 *   // outlet
 *   {#each slots.get('navbar-end') as entry (entry.id)}{@render entry.snippet()}{/each}
 *   // contributor (auto-cleans up)
 *   const slots = useAdminSlots();
 *   $effect(() => slots?.register('navbar-end', { id: 'editor', snippet: bar }));
 */
import { getContext, setContext, untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
export class AdminSlots {
    // Reactive so outlets re-render as entries come and go.
    #slots = new SvelteMap();
    /**
     * Register a snippet into a slot. Returns an unregister function — call it on
     * cleanup (returning it from an `$effect` does this automatically).
     */
    register(name, entry) {
        const current = untrack(() => this.#slots.get(name) ?? []);
        const next = [...current.filter((e) => e.id !== entry.id), entry].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        this.#slots.set(name, next);
        return () => {
            const list = untrack(() => this.#slots.get(name));
            if (!list)
                return;
            const filtered = list.filter((e) => e.id !== entry.id);
            if (filtered.length > 0)
                this.#slots.set(name, filtered);
            else
                this.#slots.delete(name);
        };
    }
    /** Entries registered in a slot, in sort order. Empty array if none. */
    get(name) {
        return this.#slots.get(name) ?? [];
    }
    /** Whether a slot has any entries — handy for conditional chrome. */
    has(name) {
        return this.get(name).length > 0;
    }
}
const ADMIN_SLOTS_KEY = Symbol.for('aphex.admin.slots');
/** Create a registry and publish it to descendants. Call once in the admin shell. */
export function setAdminSlots() {
    const slots = new AdminSlots();
    setContext(ADMIN_SLOTS_KEY, slots);
    return slots;
}
/** Read the registry. Returns `undefined` outside an admin shell (safe to guard). */
export function useAdminSlots() {
    return getContext(ADMIN_SLOTS_KEY);
}

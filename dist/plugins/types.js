/**
 * Identity helper that pins the `CMSPlugin` type for authoring. Kept a pure
 * pass-through so bundlers can tree-shake unused plugins; validation (duplicate
 * ids/names) happens in the part resolver at boot, where it can see all plugins.
 */
export function definePlugin(plugin) {
    return plugin;
}

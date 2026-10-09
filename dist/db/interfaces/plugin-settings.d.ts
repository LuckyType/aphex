/** A stored settings row: the raw persisted values for one (org, plugin) pair. */
export interface PluginSettingsRow {
    organizationId: string;
    pluginId: string;
    /** Opaque JSON blob of the plugin's settings values (secrets stored encrypted). */
    values: Record<string, unknown>;
    updatedAt: Date;
}
export interface PluginSettingsAdapter {
    /**
     * Read the stored values for a plugin in an org. Returns `null` when the plugin
     * has never been configured for that org (no row yet) — callers treat that as
     * "use declared defaults".
     */
    getPluginSettings(organizationId: string, pluginId: string): Promise<Record<string, unknown> | null>;
    /**
     * Upsert the full values object for a plugin in an org (one row per pair). The
     * passed object replaces the stored one — callers merge partial edits before
     * calling. Secret values must already be encrypted by core.
     */
    setPluginSettings(organizationId: string, pluginId: string, values: Record<string, unknown>): Promise<void>;
}
//# sourceMappingURL=plugin-settings.d.ts.map
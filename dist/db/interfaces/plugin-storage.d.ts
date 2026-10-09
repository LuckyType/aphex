import type { Page } from '../../types/events.js';
/** A stored plugin record — arbitrary JSON data under a `(plugin, collection)` namespace. */
export interface PluginStorageRecord {
    id: string;
    organizationId: string;
    /** Owning plugin namespace, e.g. `'forms'`. Package-namespace it to avoid collisions. */
    plugin: string;
    /** Sub-namespace within the plugin, e.g. a form's id `'contact'`. */
    collection: string;
    /** Arbitrary JSON payload the plugin defines. */
    data: Record<string, unknown>;
    createdAt: Date;
}
/** Input to persist a record. `id` may be supplied so it can match a related event's id. */
export interface CreatePluginRecordInput {
    id?: string;
    organizationId: string;
    plugin: string;
    collection: string;
    data: Record<string, unknown>;
}
/** Query for a plugin's records (newest first). */
export interface ListPluginRecordsOptions {
    organizationId: string;
    plugin: string;
    /** Filter to one collection within the plugin. */
    collection?: string;
    limit?: number;
    offset?: number;
}
export interface PluginStorageAdapter {
    /** Persist a record. Call on the tx handle to commit it atomically with `appendEvent`. */
    createPluginRecord(input: CreatePluginRecordInput): Promise<PluginStorageRecord>;
    /** Read one record by id (org-scoped) — e.g. a consumer resolving an event's record id. */
    getPluginRecord(organizationId: string, id: string): Promise<PluginStorageRecord | null>;
    /** List a plugin's records (optionally one collection), newest first. */
    listPluginRecords(options: ListPluginRecordsOptions): Promise<Page<PluginStorageRecord>>;
}
//# sourceMappingURL=plugin-storage.d.ts.map
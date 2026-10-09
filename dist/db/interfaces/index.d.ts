import type { DocumentAdapter } from './document.js';
import type { AssetAdapter } from './asset.js';
import type { UserProfileAdapter } from './user.js';
import type { SchemaAdapter } from './schema.js';
import type { OrganizationAdapter } from './organization.js';
import type { InstanceAdapter } from './instance.js';
import type { RolesAdapter } from './role.js';
import type { ReferenceAdapter } from './reference.js';
import type { PluginSettingsAdapter } from './plugin-settings.js';
import type { EventJobAdapter } from './events.js';
import type { PluginStorageAdapter } from './plugin-storage.js';
import type { AgentChangeSetAdapter } from './agent-change-sets.js';
export type { DocumentAdapter, DocumentFilters, CreateDocumentData, UpdateDocumentData } from './document.js';
export { RevisionConflictError } from './document.js';
export type { AssetAdapter, CreateAssetData, UpdateAssetData } from './asset.js';
export type { UserProfileAdapter, NewUserProfileData } from './user.js';
export type { SchemaAdapter } from './schema.js';
export type { OrganizationAdapter } from './organization.js';
export type { InstanceAdapter, InstanceSettings } from './instance.js';
export { BOOTSTRAP_CLAIM_ID } from './instance.js';
export type { RolesAdapter } from './role.js';
export type { ReferenceAdapter, BackReferenceRow, BackReferenceLookup } from './reference.js';
export type { PluginSettingsAdapter, PluginSettingsRow } from './plugin-settings.js';
export type { EventJobAdapter } from './events.js';
export type { PluginStorageAdapter, PluginStorageRecord, CreatePluginRecordInput, ListPluginRecordsOptions } from './plugin-storage.js';
export type { AgentChangeSetAdapter } from './agent-change-sets.js';
/**
 * Combined database adapter interface
 * Extends all entity-specific adapters for full database functionality
 */
export interface DatabaseAdapter extends DocumentAdapter, AssetAdapter, UserProfileAdapter, SchemaAdapter, OrganizationAdapter, InstanceAdapter, RolesAdapter, ReferenceAdapter, PluginSettingsAdapter, EventJobAdapter, PluginStorageAdapter, AgentChangeSetAdapter {
    connect?(): Promise<void>;
    disconnect?(): Promise<void>;
    isHealthy(): Promise<boolean>;
    /**
     * Initialize RLS (enable/disable) on tables - call after migrations
     */
    initializeRLS?(): Promise<void>;
    hierarchyEnabled: boolean;
    /**
     * Execute a function within a transaction with organization context set for RLS
     * Ensures proper isolation with connection pooling
     */
    withOrgContext?<T>(organizationId: string, fn: () => Promise<T>): Promise<T>;
    /**
     * Get all child organizations for a parent (for hierarchy support)
     */
    getChildOrganizations(parentOrganizationId: string): Promise<string[]>;
    /**
     * Check if any user profiles exist in the system (for first-user detection)
     */
    hasAnyUserProfiles?(): Promise<boolean>;
    /**
     * Execute multiple adapter operations in a single atomic transaction.
     * The callback receives a transactional version of the adapter — all operations
     * within it share the same DB transaction and commit/rollback together.
     *
     * Required: every first-party adapter implements this. It is the outbox seam —
     * emitting a domain event (`appendEvent`) alongside a state change in one callback
     * is what makes event emission atomic with the write that caused it.
     */
    withTransaction<T>(fn: (adapter: DatabaseAdapter) => Promise<T>): Promise<T>;
}
/**
 * Database provider factory interface
 * Providers are pre-configured and create adapters on demand
 */
export interface DatabaseProvider {
    name: string;
    createAdapter(): DatabaseAdapter;
}
/**
 * Generic database configuration
 */
export interface DatabaseConfig {
    connectionString?: string;
    client?: any;
    options?: {
        maxConnections?: number;
        timeout?: number;
        ssl?: boolean;
        [key: string]: any;
    };
}
/**
 * Database transaction interface (optional for advanced providers)
 */
export interface DatabaseTransaction {
    commit(): Promise<void>;
    rollback(): Promise<void>;
    isActive(): boolean;
}
/**
 * Extended database adapter with transaction support
 */
export interface TransactionalDatabaseAdapter extends DatabaseAdapter {
    beginTransaction(): Promise<DatabaseTransaction>;
    withTransaction<T>(fn: (adapter: DatabaseAdapter) => Promise<T>): Promise<T>;
}
//# sourceMappingURL=index.d.ts.map
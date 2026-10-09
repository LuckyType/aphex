import type { CMSConfig } from '../types/config.js';
import type { DatabaseAdapter } from '../db/index.js';
import { VersionService } from '../services/version-service.js';
import { ReferencesService } from '../services/references-service.js';
import type { FindOptions } from '../types/filters.js';
import type { SchemaType } from '../types/schemas.js';
import { CollectionAPI } from './collection-api.js';
import type { LocalAPIContext } from './types.js';
/**
 * Collections map - provides type-safe access to all collections
 * This interface is meant to be augmented by generated types
 */
export interface Collections {
}
/**
 * Local API - provides a unified, type-safe interface for all CMS operations
 *
 * This is the single source of truth for data operations in Aphex CMS.
 * GraphQL and REST APIs should be thin wrappers around this Local API.
 *
 * @example
 * ```typescript
 * // Initialize
 * const api = await getLocalAPI(config);
 *
 * // Query documents
 * const pages = await api.collections.pages.find(
 *   { organizationId: 'org_123', user },
 *   { where: { status: { equals: 'published' } } }
 * );
 *
 * // Create document
 * const newPage = await api.collections.pages.create(
 *   { organizationId: 'org_123', user },
 *   { title: 'Hello', slug: 'hello' }
 * );
 *
 * // System operation (bypasses RLS)
 * const allPages = await api.collections.pages.find(
 *   { organizationId: 'org_123', overrideAccess: true },
 *   { limit: 100 }
 * );
 * ```
 */
export declare class LocalAPI {
    private config;
    collections: Collections;
    private _collections;
    private userAdapter;
    private systemAdapter;
    private documentCache;
    private hierarchyService;
    versionService: VersionService;
    referencesService: ReferencesService;
    private permissions;
    private schemas;
    constructor(config: CMSConfig, userAdapter: DatabaseAdapter, systemAdapter?: DatabaseAdapter);
    /**
     * Initialize collection APIs for all document schema types
     */
    private initializeCollections;
    /**
     * Get the appropriate database adapter based on context
     * Uses system adapter if overrideAccess is true, otherwise uses user adapter
     */
    private getAdapter;
    /**
     * Get list of available collection names
     */
    getCollectionNames(): string[];
    /**
     * Check if a collection exists
     */
    hasCollection(name: string): boolean;
    /**
     * Get a collection by name (for dynamic access in route handlers and resolvers).
     *
     * The document type is a parameter because the caller usually knows it and the
     * registry cannot: `collections.page` is typed from the app's generated types,
     * but anything reached by a runtime name — a route handler resolving
     * `result.type`, or a plugin fetching a collection it contributed itself —
     * lands here. Defaulting to `unknown` keeps every existing call site working,
     * while `getCollection<Form>('form')` lets a caller that does know the shape
     * say so, instead of casting the result of every read and write.
     */
    getCollection<T = unknown>(name: string): CollectionAPI<T> | undefined;
    /**
     * Get schema for a collection
     */
    getCollectionSchema(name: string): SchemaType | undefined;
    /**
     * Find a document by ID without knowing its collection type.
     * Resolves org hierarchy and passes filterOrganizationIds to avoid RLS transactions.
     * Returns the raw document with its type, or null if not found.
     */
    findDocumentById(context: LocalAPIContext, id: string, options?: Partial<FindOptions<unknown>>): Promise<{
        type: string;
        document: unknown;
    } | null>;
    /**
     * Find all documents that reference the given target — the back-reference
     * lookup that powers the unpublish guard. Returns lightweight rows
     * (id/type/status); callers fetch full docs separately if they need data.
     */
    getBackReferences(context: LocalAPIContext, refId: string): Promise<Array<{
        id: string;
        type: string;
        status: string | null;
    }>>;
    /**
     * Batch lookup — fetch many documents by ID in one call. Routes through
     * each doc's collection so the returned shape matches `collection.findByID`
     * (perms applied, transformed, hidden fields stripped). Org hierarchy is
     * resolved once for the whole batch and threaded into each per-collection
     * call.
     *
     * Heterogeneous batches (mixed types) leave T as the default `unknown`;
     * homogeneous callers (e.g. an array-of-references-to-one-type) can
     * narrow it: `findDocumentsByIds<MenuItem>(ctx, ids)`.
     *
     * Missing/forbidden IDs are dropped from the result rather than thrown —
     * callers compare result length to input length to detect gaps. If/when
     * an adapter exposes a true `WHERE id IN (...)` batch we can short-circuit
     * the per-id collection round-trips here without changing call sites.
     */
    findDocumentsByIds<T = unknown>(context: LocalAPIContext, ids: string[], options?: Partial<FindOptions<T>>): Promise<T[]>;
}
/**
 * Create and initialize the Local API
 *
 * @param config - CMS configuration
 * @param userAdapter - Standard database adapter (respects RLS)
 * @param systemAdapter - Optional system adapter (bypasses RLS) for system operations
 * @returns LocalAPI instance
 *
 * @example
 * ```typescript
 * // Basic usage (single adapter)
 * const api = createLocalAPI(config, userDb);
 *
 * // With system adapter for RLS bypass
 * const api = createLocalAPI(config, userDb, systemDb);
 * ```
 */
export declare function createLocalAPI(config: CMSConfig, userAdapter: DatabaseAdapter, systemAdapter?: DatabaseAdapter): LocalAPI;
/**
 * Get the Local API instance
 * Throws if Local API hasn't been initialized yet
 *
 * @returns LocalAPI instance
 * @throws Error if Local API not initialized
 *
 * @example
 * ```typescript
 * const api = getLocalAPI();
 * const pages = await api.collections.pages.find(...);
 * ```
 */
export declare function getLocalAPI(): LocalAPI;
export { CollectionAPI, SingletonOperationError, DocumentValidationError, type DocumentResult, type SingletonCollection } from './collection-api.js';
export { PermissionChecker, PermissionError } from './permissions.js';
export type { LocalAPIContext, CreateOptions, UpdateOptions } from './types.js';
export { authToContext, requireAuth, systemContext } from './auth-helpers.js';
//# sourceMappingURL=index.d.ts.map
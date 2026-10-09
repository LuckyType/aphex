import type { DocumentCache } from '../cache/index.js';
import type { DatabaseAdapter } from '../db/index.js';
import type { HierarchyService } from '../services/hierarchy-service.js';
import type { VersionService } from '../services/version-service.js';
import type { ReferencesService } from '../services/references-service.js';
import type { Where, WhereTyped, FindOptions, FindResult } from '../types/filters.js';
import type { Document } from '../types/document.js';
import type { LocalAPIContext } from './types.js';
import type { SchemaType } from '../types/schemas.js';
import { PermissionChecker } from './permissions.js';
import { type DocumentValidationResult, type FieldErrors } from '../field-validation/utils.js';
import type { AppendEventInput, Job } from '../types/events.js';
/**
 * Result from create/update operations that includes validation
 */
export interface DocumentResult<T> {
    document: T;
    validation: DocumentValidationResult;
}
/**
 * Thrown when a caller tries to perform an operation that's invalid for a
 * singleton schema (e.g. delete the canonical row, or call `get()` on a
 * non-singleton collection). Route handlers translate this to HTTP 400.
 */
export declare class SingletonOperationError extends Error {
    constructor(message: string);
}
/**
 * Thrown when a write is rejected as *malformed* — a field the schema never
 * declared, or a value of the wrong shape. The caller sent bad data, so this is
 * a 400, not a 500.
 *
 * It exists as a type because the alternative was route handlers sniffing
 * `error.message.includes('validation errors')`, which the structural message
 * ("Invalid document data - …") doesn't match — so every rejected payload was
 * reported to HTTP and MCP clients as a server error. Carries the structured
 * `errors` so a handler (or an agent) can name the offending fields without
 * parsing prose.
 */
export declare class DocumentValidationError extends Error {
    readonly errors: FieldErrors[];
    constructor(message: string, errors: FieldErrors[]);
}
/**
 * Subset of CollectionAPI methods that are valid on a singleton schema.
 * Codegen emits this type for singleton entries in the Collections interface
 * so consumers can't accidentally call list/findByID/create/delete on them.
 *
 * The runtime is still a regular CollectionAPI — this is purely a TS narrow.
 */
export type SingletonCollection<T = Document> = Pick<CollectionAPI<T>, 'get' | 'getSingletonId' | 'update' | 'publish' | 'unpublish' | 'schema'>;
/**
 * Collection API - provides type-safe operations for a single collection
 * Generic type T represents the document type for this collection
 */
export declare class CollectionAPI<T = Document> {
    private collectionName;
    private databaseAdapter;
    private _schema;
    private permissions;
    private documentCache?;
    private hierarchyService?;
    private versionService?;
    private referencesService?;
    private schemaRegistry?;
    constructor(collectionName: string, databaseAdapter: DatabaseAdapter, _schema: SchemaType, permissions: PermissionChecker, documentCache?: (DocumentCache | null) | undefined, hierarchyService?: HierarchyService | undefined, versionService?: VersionService | undefined, referencesService?: ReferencesService | undefined, schemaRegistry?: SchemaType[] | undefined);
    /**
     * Refresh the back-reference index for this doc using the freshly-saved
     * draftData.
     *
     * Takes the adapter to write through — always a `withTransaction` handle on
     * the write paths, so the index rows commit or roll back with the document
     * itself. It throws now, which is the point: this index backs the publish and
     * unpublish guards, and a guard that quietly weakens when its write failed is
     * more dangerous than no guard.
     */
    private syncReferences;
    /**
     * Refresh the asset-reference index for this doc — which assets its draft and
     * published data use. Same contract as {@link syncReferences}: written through
     * the caller's transaction handle, and throws.
     *
     * Built here rather than injected: it needs nothing but the adapter this class
     * already holds, and threading a tenth constructor argument through every call
     * site would be the only other option.
     */
    private get assetReferencesService();
    private _assetReferencesService?;
    private syncAssetReferences;
    /**
     * Recompute the document's full-text search index from freshly-saved
     * draftData. Best-effort, same shape as {@link syncReferences}: not part
     * of the write transaction, self-healing on the next edit if missed.
     */
    private syncSearchText;
    /**
     * Get the schema for this collection
     */
    get schema(): SchemaType;
    /**
     * Compute the deterministic id of the canonical row for this singleton
     * collection within a specific organization. Returns `undefined` for
     * regular (non-singleton) schemas. Surfaced for migrations and tests;
     * normal usage should prefer `get()`.
     */
    getSingletonId(context: LocalAPIContext): string | undefined;
    /**
     * Resolve the singleton document. Lazy-creates an empty draft on first
     * call so callers always get a row back. Only valid for schemas marked
     * `singleton: true`; throws on regular collections.
     */
    get(context: LocalAPIContext, options?: Partial<FindOptions<T>>): Promise<T>;
    /**
     * Find multiple documents with advanced filtering and pagination
     *
     * @example
     * ```typescript
     * const result = await api.collections.pages.find(
     *   { organizationId: 'org_123', user },
     *   {
     *     where: {
     *       status: { equals: 'published' },
     *       'author.name': { contains: 'John' }
     *     },
     *     limit: 20,
     *     sort: '-publishedAt'
     *   }
     * );
     * ```
     */
    find(context: LocalAPIContext, options?: FindOptions<T>): Promise<FindResult<T>>;
    private resolveHiddenReadFields;
    private resolveHiddenWriteFields;
    /**
     * Fetch a document by ID, scoped to this collection.
     *
     * Every permission check here is evaluated against `this.collectionName`, but
     * document IDs are globally unique — so a lookup that matched on ID alone let a
     * caller authorised for one collection read or mutate a known ID belonging to a
     * restricted one, through the Local API, GraphQL, or MCP alike.
     *
     * A type mismatch is reported as "not found" rather than "forbidden" on purpose:
     * the caller has no permission to learn that the ID exists elsewhere.
     *
     * Deliberately *not* used for reference lookups in `publish`, which resolve
     * documents of arbitrary types by design.
     */
    /**
     * Reject a write whose payload is malformed, draft or not.
     *
     * Drafts skip *content* validation on purpose — you must be able to save
     * half-finished work. But "incomplete" and "malformed" are different
     * questions: a missing title is a draft, a string where an array belongs (or a
     * field the schema never declared) is corruption, and letting it through means
     * it's already in storage by the time anyone validates at publish.
     */
    private assertStructurallyValid;
    private findOwnDocById;
    /**
     * Find a single document by ID
     *
     * @example
     * ```typescript
     * const page = await api.collections.pages.findByID(
     *   { organizationId: 'org_123', user },
     *   'doc_123',
     *   { depth: 1, perspective: 'published' }
     * );
     * ```
     */
    findByID(context: LocalAPIContext, id: string, options?: Partial<FindOptions<T>>): Promise<T | null>;
    /**
     * Count documents matching a where clause
     *
     * @example
     * ```typescript
     * const count = await api.collections.pages.count(
     *   { organizationId: 'org_123', user },
     *   { where: { status: { equals: 'published' } } }
     * );
     * ```
     */
    count(context: LocalAPIContext, options?: {
        where?: WhereTyped<T> | Where;
    }): Promise<number>;
    /**
     * Create a new document
     *
     * @example
     * ```typescript
     * const result = await api.collections.pages.create(
     *   { organizationId: 'org_123', user },
     *   {
     *     title: 'New Page',
     *     slug: 'new-page',
     *     content: []
     *   }
     * );
     * // result.document - the created document
     * // result.validation - validation results
     * ```
     */
    create(context: LocalAPIContext, data: Omit<T, 'id' | '_meta'>, options?: {
        publish?: boolean;
        skipVersioning?: boolean;
        id?: string;
        /** Domain events that must commit atomically with the new document. */
        outboxEvents?: Array<Omit<AppendEventInput, 'organizationId'>>;
    }): Promise<DocumentResult<T>>;
    /**
     * Update an existing document
     *
     * @example
     * ```typescript
     * const result = await api.collections.pages.update(
     *   { organizationId: 'org_123', user },
     *   'doc_123',
     *   { title: 'Updated Title' },
     *   { publish: true }
     * );
     * // result.document - the updated document
     * // result.validation - validation results
     * ```
     */
    update(context: LocalAPIContext, id: string, data: Partial<Omit<T, 'id' | '_meta'>>, options?: {
        publish?: boolean;
        skipVersioning?: boolean;
        expectedRevision?: number;
    }): Promise<DocumentResult<T> | null>;
    /**
     * Delete a document
     *
     * @example
     * ```typescript
     * const deleted = await api.collections.pages.delete(
     *   { organizationId: 'org_123', user },
     *   'doc_123'
     * );
     * ```
     */
    delete(context: LocalAPIContext, id: string): Promise<boolean>;
    /**
     * Publish a document
     *
     * @example
     * ```typescript
     * const published = await api.collections.pages.publish(
     *   { organizationId: 'org_123', user },
     *   'doc_123'
     * );
     * ```
     */
    /**
     * Publish without a version snapshot — the branch taken when there's no version service or
     * the caller passed `skipVersioning`. Still emits `document.published` (and its outbox row)
     * atomically with the publish, so the domain fact fires on EVERY publish path, not only the
     * versioned one. The versioned branch emits the same event from `versionService.publishTx`.
     */
    private publishWithoutVersion;
    publish(context: LocalAPIContext, id: string, options?: {
        expectedRevision?: number;
    }): Promise<T | null>;
    /**
     * Unpublish a document
     *
     * @example
     * ```typescript
     * const unpublished = await api.collections.pages.unpublish(
     *   { organizationId: 'org_123', user },
     *   'doc_123'
     * );
     * ```
     */
    unpublish(context: LocalAPIContext, id: string, options?: {
        expectedRevision?: number;
    }): Promise<T | null>;
    /**
     * Pending scheduled publish/unpublish jobs for one document. Scheduled jobs are few
     * and `pending` is a small set, so filtering the org's pending jobs by documentId in
     * memory is cheap and avoids a dialect-specific JSON query on the hot editor path.
     */
    private pendingScheduledFor;
    /**
     * Cancel any pending schedule of ONE direction for a document — used when a manual
     * publish/unpublish supersedes a schedule of the same kind. Only same-direction is
     * cancelled on purpose: "publish now, auto-unpublish Friday" and "unpublish now,
     * republish Monday" are legitimate future transitions, so a manual publish leaves a
     * pending unpublish (and vice versa) alone. Without this, the queued job would fire at
     * `runAt` and re-run the same transition — re-emitting `document.published`/`unpublished`
     * and firing every consumer a second time (duplicate notifications, webhooks, cache busts).
     */
    private cancelPendingScheduleOfType;
    /**
     * Schedule a publish for a future `runAt`. Enqueues a `document.publish` job; the
     * worker runs `publish()` at that time (re-validating, guarding references, emitting
     * `document.published`). The permission check happens NOW — you must be able to publish
     * to schedule one — so an unauthorized caller can't queue work to run later as the system.
     * Actual publish-time validation still runs then, so a doc that goes invalid before
     * `runAt` simply fails/retries rather than publishing bad content.
     *
     * Replace semantics: any existing pending schedule for this document is cancelled first,
     * so a document has at most one pending schedule (rescheduling can't double-publish).
     */
    schedulePublish(context: LocalAPIContext, id: string, runAt: Date): Promise<Job>;
    /** Schedule an unpublish for a future `runAt`. Permission-checked now; replaces any existing pending schedule. */
    scheduleUnpublish(context: LocalAPIContext, id: string, runAt: Date): Promise<Job>;
    /** Pending scheduled publish/unpublish jobs for a document (read-gated) — for the editor's schedule indicator. */
    getScheduled(context: LocalAPIContext, id: string): Promise<Job[]>;
    /** Cancel all pending scheduled publish/unpublish jobs for a document. Returns how many were cancelled. */
    cancelScheduled(context: LocalAPIContext, id: string): Promise<number>;
}
//# sourceMappingURL=collection-api.d.ts.map
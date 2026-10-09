import type { CacheAdapter } from './interfaces/cache.js';
/**
 * Document-aware cache wrapper.
 * Translates document/collection operations into generic key-value calls on the underlying CacheAdapter.
 */
export declare class DocumentCache {
    private adapter;
    constructor(adapter: CacheAdapter);
    getDocument<T>(orgId: string, docId: string): Promise<T | null>;
    setDocument<T>(orgId: string, docId: string, value: T): Promise<void>;
    getQuery<T>(orgId: string, collection: string, options: object): Promise<T | null>;
    setQuery<T>(orgId: string, collection: string, options: object, value: T): Promise<void>;
    invalidateDocument(orgId: string, docId: string): Promise<void>;
    invalidateCollection(orgId: string, collection: string): Promise<void>;
    flush(): Promise<void>;
    private buildQueryKey;
}
//# sourceMappingURL=document-cache.d.ts.map
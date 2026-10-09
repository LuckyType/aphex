import type { CacheAdapter } from '../interfaces/cache.js';
export interface InMemoryCacheOptions {
    /** Maximum number of entries. Oldest entries are evicted when exceeded. Defaults to 1000. */
    maxSize?: number;
    /** Default TTL in seconds. No expiry if omitted. */
    defaultTTL?: number;
}
export declare class InMemoryCacheAdapter implements CacheAdapter {
    readonly name = "in-memory";
    private store;
    private maxSize;
    private defaultTTL;
    constructor(options?: InMemoryCacheOptions);
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    invalidateByPrefix(prefix: string): Promise<void>;
    flush(): Promise<void>;
    isHealthy(): Promise<boolean>;
}
//# sourceMappingURL=in-memory-cache-adapter.d.ts.map
export class InMemoryCacheAdapter {
    name = 'in-memory';
    store = new Map();
    maxSize;
    defaultTTL;
    constructor(options = {}) {
        this.maxSize = options.maxSize ?? 1000;
        this.defaultTTL = options.defaultTTL;
    }
    async get(key) {
        const entry = this.store.get(key);
        if (!entry)
            return null;
        if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }
    async set(key, value, ttl) {
        // Evict oldest entry if at capacity
        if (!this.store.has(key) && this.store.size >= this.maxSize) {
            const firstKey = this.store.keys().next().value;
            if (firstKey !== undefined) {
                this.store.delete(firstKey);
            }
        }
        const seconds = ttl ?? this.defaultTTL;
        this.store.set(key, {
            value,
            expiresAt: seconds != null ? Date.now() + seconds * 1000 : null
        });
    }
    async delete(key) {
        this.store.delete(key);
    }
    async invalidateByPrefix(prefix) {
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) {
                this.store.delete(key);
            }
        }
    }
    async flush() {
        this.store.clear();
    }
    async isHealthy() {
        return true;
    }
}

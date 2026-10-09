/**
 * Document-aware cache wrapper.
 * Translates document/collection operations into generic key-value calls on the underlying CacheAdapter.
 */
export class DocumentCache {
    adapter;
    constructor(adapter) {
        this.adapter = adapter;
    }
    async getDocument(orgId, docId) {
        return this.adapter.get(`doc:${orgId}:${docId}`);
    }
    async setDocument(orgId, docId, value) {
        await this.adapter.set(`doc:${orgId}:${docId}`, value);
    }
    async getQuery(orgId, collection, options) {
        return this.adapter.get(this.buildQueryKey(orgId, collection, options));
    }
    async setQuery(orgId, collection, options, value) {
        await this.adapter.set(this.buildQueryKey(orgId, collection, options), value);
    }
    async invalidateDocument(orgId, docId) {
        await this.adapter.delete(`doc:${orgId}:${docId}`);
    }
    async invalidateCollection(orgId, collection) {
        await this.adapter.invalidateByPrefix(`query:${orgId}:${collection}:`);
    }
    async flush() {
        await this.adapter.flush();
    }
    buildQueryKey(orgId, collection, options) {
        const normalized = JSON.stringify(options, (_, value) => {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                return Object.keys(value)
                    .sort()
                    .reduce((sorted, key) => {
                    sorted[key] = value[key];
                    return sorted;
                }, {});
            }
            return value;
        });
        return `query:${orgId}:${collection}:${normalized}`;
    }
}

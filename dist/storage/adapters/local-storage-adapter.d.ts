import type { StorageAdapter, StorageConfig, UploadFileData, StorageFile } from '../interfaces/storage.js';
/**
 * Pure local file system storage adapter - only handles files
 */
export declare class LocalStorageAdapter implements StorageAdapter {
    readonly name = "local";
    private config;
    constructor(config: StorageConfig);
    /** See {@link StorageAdapter.setMaxFileSize}. */
    setMaxFileSize(bytes: number): void;
    /**
     * Strip path traversal sequences, keeping only the base filename.
     */
    private sanitizeFilename;
    /**
     * Generate unique filename preserving original name
     */
    private generateUniqueFilename;
    /**
     * Parse filename into name and extension
     */
    private parseFilename;
    /**
     * Check if file exists on disk
     */
    private fileExistsOnDisk;
    /**
     * Store a file and return storage info
     */
    store(data: UploadFileData): Promise<StorageFile>;
    /**
     * Make a caller-supplied key safe to join onto `basePath`.
     *
     * Keys may contain `/` — that's the point, `{assetId}/original.png` is a
     * directory and a file. What they may not do is climb out of the storage
     * root, so each segment is stripped of traversal and empty segments are
     * dropped. A key that sanitizes to nothing falls back to the raw basename.
     */
    private sanitizeKey;
    /**
     * Resolve a path and prove it stays inside `basePath`, or throw.
     *
     * Every read/write entry point funnels through here. Keeping one copy is a
     * safety property, not tidiness: this is the only thing standing between a
     * caller-influenced path and the rest of the filesystem, and a
     * per-call-site copy is how one of them ends up missing the check.
     */
    private isWithin;
    private assertWithinBase;
    /**
     * Where a key lives on disk. Mirrors what `store()` reports, for callers
     * holding a key that never went through it.
     */
    resolvePath(key: string): string;
    /**
     * Read a file from storage
     * Used by API endpoint to serve files
     */
    getObject(path: string): Promise<Buffer>;
    /**
     * Read a file from storage as a stream.
     *
     * Same containment check as `getObject` — a streaming read is still a read,
     * and skipping the check here would reintroduce the traversal escape on the
     * path callers now prefer.
     */
    getStream(path: string): Promise<ReadableStream<Uint8Array>>;
    /**
     * Ranged read. Node's `start`/`end` are both inclusive, which is already the
     * convention the port specifies, so the bounds pass through unchanged.
     */
    getObjectRange(path: string, start: number, end: number): Promise<ReadableStream<Uint8Array>>;
    /**
     * Delete a file from storage
     */
    delete(path: string): Promise<boolean>;
    /**
     * Check if file exists
     */
    exists(path: string): Promise<boolean>;
    /**
     * Get public URL for a file path
     */
    getUrl(path: string): string;
    /**
     * Get storage information
     */
    getStorageInfo(): Promise<{
        totalSize: number;
        availableSpace?: number;
    }>;
    /**
     * Health check - test if we can write to storage
     */
    isHealthy(): Promise<boolean>;
}
//# sourceMappingURL=local-storage-adapter.d.ts.map
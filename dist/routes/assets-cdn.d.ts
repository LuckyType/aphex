import type { RequestHandler } from '@sveltejs/kit';
import type { StorageAdapter } from '../storage/interfaces/storage.js';
/**
 * Parse a single byte range against a known object size.
 *
 * Returns `null` when there is nothing to honour — no header, a form we don't
 * serve, or an unknown size — in which case the caller answers `200` with the
 * whole body. That is a legal response to any `Range` request, which is what
 * makes ignoring multipart ranges (`bytes=0-99,200-299`) acceptable: they are
 * fiddly to emit, essentially nothing sends them, and a full body is correct.
 *
 * `'unsatisfiable'` is different from `null`: the range is well-formed but lies
 * outside the object, which must be answered `416`, not `200`. A client that
 * seeks past the end otherwise receives a full file it did not ask for.
 *
 * Both bounds in the result are **inclusive**, as in the header itself.
 */
export declare function parseByteRange(header: string | null, size: number | null): {
    start: number;
    end: number;
} | 'unsatisfiable' | null;
/**
 * Read a video's poster frame through the adapter's own path for its key.
 * Handed the bare key, the local adapter (cms-core 11.2.1) resolves it
 * against the working directory, outside its base, and refuses, so every
 * poster read as missing.
 */
export declare function readPoster(storageAdapter: StorageAdapter, assetId: string): Promise<Buffer>;
export declare const GET: RequestHandler;
//# sourceMappingURL=assets-cdn.d.ts.map
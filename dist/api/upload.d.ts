import type { ApiResponse } from './types.js';
/**
 * Uploads, on XMLHttpRequest rather than fetch.
 *
 * Not nostalgia: `fetch` has no upload progress event. Request body streams are
 * the standards-track answer and are still neither broadly supported nor usable
 * with a plain `FormData`, so XHR remains the only way to report how far a
 * multi-megabyte upload has actually got. Everything else here exists to make
 * that swap invisible — same `ApiResponse`, same `ApiError`, same defensive
 * parsing — so callers can't tell which transport ran.
 */
export interface UploadOptions {
    /** Called with 0–100 as the body is sent. Never called after completion. */
    onProgress?: (percent: number) => void;
    /** Aborts the upload. The promise rejects with an `ApiError` of status 0. */
    signal?: AbortSignal;
    /** Milliseconds of inactivity before giving up. */
    timeoutMs?: number;
}
/**
 * POST a FormData body with progress reporting.
 *
 * Resolves with the parsed body on success and rejects with `ApiError`
 * otherwise, matching `ApiClient` exactly.
 */
/**
 * PUT a file straight to object storage, reporting progress.
 *
 * Distinct from {@link uploadFormData} in two ways that matter:
 *
 * - **No credentials.** The target is a third-party origin and the URL already
 *   carries its own signature. Sending cookies would leak the session to the
 *   storage provider and trip CORS besides.
 * - **Raw body, not FormData.** The signature covers the object bytes; wrapping
 *   them in multipart framing would store the framing.
 *
 * A failure here is very often missing bucket CORS rather than a broken file,
 * and the browser deliberately hides the distinction — so the error says so.
 */
export declare function putToStorage(url: string, file: File | Blob, headers?: Record<string, string>, options?: UploadOptions): Promise<void>;
export declare function uploadFormData<T>(url: string, body: FormData, options?: UploadOptions): Promise<ApiResponse<T>>;
//# sourceMappingURL=upload.d.ts.map
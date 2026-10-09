/**
 * Detect MIME type from file magic bytes (file signatures).
 * Returns the detected MIME type, or null if unknown.
 */
export declare function detectMimeType(buffer: Buffer, filename?: string): string | null;
export interface FileValidationOptions {
    /** Allowed MIME types (e.g., ['application/pdf', 'image/*']). If empty/undefined, all non-blocked types allowed. */
    allowedMimeTypes?: readonly string[];
    /** Max file size in bytes */
    maxSize?: number;
}
export interface FileValidationResult {
    valid: boolean;
    error?: string;
    detectedMimeType: string | null;
}
/**
 * Validate an uploaded file's actual content against allowed types.
 * Checks magic bytes, not just the client-provided MIME type.
 */
export declare function validateFile(buffer: Buffer, filename: string, clientMimeType: string, options?: FileValidationOptions): FileValidationResult;
//# sourceMappingURL=mime-detect.d.ts.map
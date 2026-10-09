import type { SchemaType } from '../types/schemas.js';
export type AcceptedFileTypes = string | readonly string[];
/** Conservative installation-wide policy used when an app does not provide one. */
export declare const DEFAULT_ALLOWED_MIME_TYPES: readonly string[];
/** Normalize native input syntax and schema arrays to individual accept tokens. */
export declare function normalizeAcceptedFileTypes(accept: AcceptedFileTypes | undefined): string[];
export declare function acceptedFileTypesInputValue(accept: AcceptedFileTypes | undefined): string | undefined;
/**
 * The MIME type to match a file against in the browser: what it reported, or a
 * guess from the extension when it reported nothing.
 *
 * Deliberately **not** used inside `isAcceptedFileType`, and never on the server.
 * This is a picker hint, not a security rule: it can only ever get a file as far
 * as the upload endpoint, which re-derives the type from magic bytes in
 * `validateFile` and rejects it there if the extension was lying. Wiring it into
 * the shared matcher would let a `.heic` full of garbage past a server-side
 * allow-list, which is exactly the check that shouldn't trust a filename.
 */
export declare function effectiveFileType(filename: string, mimeType: string): string;
export declare function isAcceptedFileType(filename: string, mimeType: string, accept: AcceptedFileTypes | undefined): boolean;
export declare function validateGlobalAllowedMimeTypes(allowedMimeTypes: readonly string[] | undefined): void;
export declare function resolveGlobalAllowedMimeTypes(instances?: {
    config?: {
        upload?: {
            allowedMimeTypes?: string[];
        };
    };
}): string[];
/** Resolve the effective rule for a schema field. Images default to image-only. */
export declare function resolveFieldAcceptedFileTypes(schema: SchemaType | null | undefined, fieldPath: string | undefined): string[] | undefined;
//# sourceMappingURL=file-accept.d.ts.map
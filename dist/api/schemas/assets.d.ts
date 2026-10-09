import { z } from 'zod';
export declare const assetSchema: z.ZodObject<{
    id: z.ZodString;
    organizationId: z.ZodString;
    assetType: z.ZodString;
    filename: z.ZodString;
    originalFilename: z.ZodString;
    mimeType: z.ZodString;
    size: z.ZodNumber;
    url: z.ZodString;
    path: z.ZodString;
    storageAdapter: z.ZodString;
    width: z.ZodNullable<z.ZodNumber>;
    height: z.ZodNullable<z.ZodNumber>;
    metadata: z.ZodOptional<z.ZodNullable<z.ZodUnknown>>;
    title: z.ZodNullable<z.ZodString>;
    description: z.ZodNullable<z.ZodString>;
    alt: z.ZodNullable<z.ZodString>;
    creditLine: z.ZodNullable<z.ZodString>;
    createdBy: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodNullable<z.ZodUnion<readonly [z.ZodString, z.ZodDate]>>;
    updatedAt: z.ZodNullable<z.ZodUnion<readonly [z.ZodString, z.ZodDate]>>;
}, z.core.$loose>;
export declare const assetReferenceSchema: z.ZodObject<{
    documentId: z.ZodString;
    type: z.ZodString;
    title: z.ZodString;
    status: z.ZodNullable<z.ZodString>;
    fieldPaths: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const listAssetsQuery: z.ZodObject<{
    assetType: z.ZodOptional<z.ZodEnum<{
        image: "image";
        file: "file";
    }>>;
    mimeType: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<{
        image: "image";
        document: "document";
        svg: "svg";
        video: "video";
        audio: "audio";
    }>>;
    search: z.ZodOptional<z.ZodString>;
    usage: z.ZodOptional<z.ZodEnum<{
        "in-use": "in-use";
        unused: "unused";
    }>>;
    includeSystem: z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodPipe<z.ZodEnum<{
        true: "true";
        false: "false";
    }>, z.ZodTransform<boolean, "true" | "false">>]>>;
    sort: z.ZodOptional<z.ZodEnum<{
        newest: "newest";
        oldest: "oldest";
        "name-asc": "name-asc";
        "name-desc": "name-desc";
    }>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const listAssetsResponse: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        organizationId: z.ZodString;
        assetType: z.ZodString;
        filename: z.ZodString;
        originalFilename: z.ZodString;
        mimeType: z.ZodString;
        size: z.ZodNumber;
        url: z.ZodString;
        path: z.ZodString;
        storageAdapter: z.ZodString;
        width: z.ZodNullable<z.ZodNumber>;
        height: z.ZodNullable<z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodNullable<z.ZodUnknown>>;
        title: z.ZodNullable<z.ZodString>;
        description: z.ZodNullable<z.ZodString>;
        alt: z.ZodNullable<z.ZodString>;
        creditLine: z.ZodNullable<z.ZodString>;
        createdBy: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodNullable<z.ZodUnion<readonly [z.ZodString, z.ZodDate]>>;
        updatedAt: z.ZodNullable<z.ZodUnion<readonly [z.ZodString, z.ZodDate]>>;
    }, z.core.$loose>>;
    pagination: z.ZodObject<{
        total: z.ZodNumber;
        page: z.ZodNumber;
        pageSize: z.ZodNumber;
        totalPages: z.ZodNumber;
        hasNextPage: z.ZodBoolean;
        hasPrevPage: z.ZodBoolean;
    }, z.core.$strip>;
    indexing: z.ZodBoolean;
    limits: z.ZodObject<{
        maxUploadBytes: z.ZodNumber;
        allowedMimeTypes: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString>>>;
        directUpload: z.ZodBoolean;
    }, z.core.$strip>;
    images: z.ZodNullable<z.ZodObject<{
        widths: z.ZodArray<z.ZodNumber>;
        quality: z.ZodNumber;
        configHash: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const getAssetResponse: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<{
        id: z.ZodString;
        organizationId: z.ZodString;
        assetType: z.ZodString;
        filename: z.ZodString;
        originalFilename: z.ZodString;
        mimeType: z.ZodString;
        size: z.ZodNumber;
        url: z.ZodString;
        path: z.ZodString;
        storageAdapter: z.ZodString;
        width: z.ZodNullable<z.ZodNumber>;
        height: z.ZodNullable<z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodNullable<z.ZodUnknown>>;
        title: z.ZodNullable<z.ZodString>;
        description: z.ZodNullable<z.ZodString>;
        alt: z.ZodNullable<z.ZodString>;
        creditLine: z.ZodNullable<z.ZodString>;
        createdBy: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodNullable<z.ZodUnion<readonly [z.ZodString, z.ZodDate]>>;
        updatedAt: z.ZodNullable<z.ZodUnion<readonly [z.ZodString, z.ZodDate]>>;
    }, z.core.$loose>;
}, z.core.$strip>;
/**
 * Metadata patch. Every field is a tri-state: omitted leaves the column alone,
 * `null` clears it, a string sets it.
 *
 * `.nullable()` is the load-bearing part. Without it an emptied input could only
 * be sent as `undefined`, which `JSON.stringify` drops from the body entirely —
 * so metadata could be added but never removed.
 */
export declare const updateAssetRequest: z.ZodObject<{
    originalFilename: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    alt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    creditLine: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const updateAssetResponse: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<{
        id: z.ZodString;
        organizationId: z.ZodString;
        assetType: z.ZodString;
        filename: z.ZodString;
        originalFilename: z.ZodString;
        mimeType: z.ZodString;
        size: z.ZodNumber;
        url: z.ZodString;
        path: z.ZodString;
        storageAdapter: z.ZodString;
        width: z.ZodNullable<z.ZodNumber>;
        height: z.ZodNullable<z.ZodNumber>;
        metadata: z.ZodOptional<z.ZodNullable<z.ZodUnknown>>;
        title: z.ZodNullable<z.ZodString>;
        description: z.ZodNullable<z.ZodString>;
        alt: z.ZodNullable<z.ZodString>;
        creditLine: z.ZodNullable<z.ZodString>;
        createdBy: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodNullable<z.ZodUnion<readonly [z.ZodString, z.ZodDate]>>;
        updatedAt: z.ZodNullable<z.ZodUnion<readonly [z.ZodString, z.ZodDate]>>;
    }, z.core.$loose>;
}, z.core.$strip>;
export declare const deleteAssetResponse: z.ZodObject<{
    success: z.ZodLiteral<true>;
}, z.core.$strip>;
/**
 * Body of the 409 returned when an asset is still referenced. Hand-written
 * rather than zod because it's a response shape (see the API-contracts note in
 * CLAUDE.md), and it arrives on the client as `ApiError.response`.
 *
 * `unregisteredTypes` lists the schema types among `references` that are no
 * longer registered in `schemaTypes`. Those documents cannot be opened in the
 * admin, so the reference cannot be removed by hand — a non-empty array means
 * force-delete is the user's only route.
 */
export interface AssetDeleteConflict {
    success: false;
    error: string;
    references: AssetReference[];
    unregisteredTypes: string[];
}
export declare const bulkDeleteAssetsRequest: z.ZodObject<{
    ids: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const bulkDeleteAssetsResponse: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<{
        deleted: z.ZodNumber;
        failed: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
/**
 * Body of the 409 from a bulk delete blocked by references — the batch sibling
 * of {@link AssetDeleteConflict}.
 *
 * It reports ids rather than the references themselves: a batch of a hundred
 * assets could carry thousands of referencing documents, and the caller's next
 * move is to narrow the selection or force, not to read them all. Same
 * `unregisteredTypes` meaning, and the same implication — non-empty means force
 * is the only route, because those documents cannot be opened in the admin.
 */
export interface BulkAssetDeleteConflict {
    success: false;
    error: string;
    referencedIds: string[];
    unregisteredTypes: string[];
}
export declare const getAssetReferencesResponse: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<{
        references: z.ZodArray<z.ZodObject<{
            documentId: z.ZodString;
            type: z.ZodString;
            title: z.ZodString;
            status: z.ZodNullable<z.ZodString>;
            fieldPaths: z.ZodOptional<z.ZodArray<z.ZodString>>;
        }, z.core.$strip>>;
        total: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const assetReferenceCountsRequest: z.ZodObject<{
    ids: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const assetReferenceCountsResponse: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodRecord<z.ZodString, z.ZodNumber>;
}, z.core.$strip>;
/**
 * Ask for a URL the browser can upload directly to.
 *
 * Deliberately carries no key or path. The server mints the asset id and
 * derives the destination from it, because a caller-supplied key would let
 * anyone holding `asset.upload` write anywhere in the bucket — including over
 * an existing asset's original.
 */
export declare const createUploadUrlRequest: z.ZodObject<{
    filename: z.ZodString;
    mimeType: z.ZodString;
    size: z.ZodNumber;
    schemaType: z.ZodOptional<z.ZodString>;
    fieldPath: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Report that a direct upload finished, so the asset row can be created.
 *
 * Only the id is trusted. Everything describing the object — that it exists,
 * how large it is — is read back from storage, never taken from the client.
 */
export declare const confirmUploadRequest: z.ZodObject<{
    assetId: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    alt: z.ZodOptional<z.ZodString>;
    creditLine: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type AssetDTO = z.infer<typeof assetSchema>;
export type AssetReference = z.infer<typeof assetReferenceSchema>;
export type ListAssetsQuery = z.input<typeof listAssetsQuery>;
export type ListAssetsResponse = z.infer<typeof listAssetsResponse>;
export type GetAssetResponse = z.infer<typeof getAssetResponse>;
export type UpdateAssetRequest = z.infer<typeof updateAssetRequest>;
export type UpdateAssetResponse = z.infer<typeof updateAssetResponse>;
export type DeleteAssetResponse = z.infer<typeof deleteAssetResponse>;
export type BulkDeleteAssetsRequest = z.infer<typeof bulkDeleteAssetsRequest>;
export type BulkDeleteAssetsResponse = z.infer<typeof bulkDeleteAssetsResponse>;
export type GetAssetReferencesResponse = z.infer<typeof getAssetReferencesResponse>;
export type AssetReferenceCountsRequest = z.infer<typeof assetReferenceCountsRequest>;
export type AssetReferenceCountsResponse = z.infer<typeof assetReferenceCountsResponse>;
export type CreateUploadUrlRequest = z.infer<typeof createUploadUrlRequest>;
export type ConfirmUploadRequest = z.infer<typeof confirmUploadRequest>;
//# sourceMappingURL=assets.d.ts.map
import { z } from 'zod';
export declare const documentMetaSchema: z.ZodObject<{
    status: z.ZodEnum<{
        draft: "draft";
        published: "published";
        unpublished: "unpublished";
    }>;
    publishedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    updatedAt: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodString>;
    publishedHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    draftHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    revision: z.ZodOptional<z.ZodNumber>;
}, z.core.$loose>;
export declare const documentSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    draftData: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    publishedData: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
    _meta: z.ZodOptional<z.ZodObject<{
        status: z.ZodEnum<{
            draft: "draft";
            published: "published";
            unpublished: "unpublished";
        }>;
        publishedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        updatedAt: z.ZodOptional<z.ZodString>;
        createdAt: z.ZodOptional<z.ZodString>;
        publishedHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        draftHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        revision: z.ZodOptional<z.ZodNumber>;
    }, z.core.$loose>>;
}, z.core.$loose>;
export declare const paginationMetaSchema: z.ZodObject<{
    total: z.ZodNumber;
    page: z.ZodNumber;
    pageSize: z.ZodNumber;
    totalPages: z.ZodNumber;
    hasNextPage: z.ZodBoolean;
    hasPrevPage: z.ZodBoolean;
}, z.core.$strip>;
export declare const listDocumentsQuery: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    docType: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    pageSize: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    depth: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    sort: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>>;
    perspective: z.ZodOptional<z.ZodEnum<{
        draft: "draft";
        published: "published";
    }>>;
    includeChildOrganizations: z.ZodPipe<z.ZodOptional<z.ZodUnion<readonly [z.ZodBoolean, z.ZodEnum<{
        true: "true";
        false: "false";
    }>]>>, z.ZodTransform<boolean, boolean | "true" | "false" | undefined>>;
}, z.core.$strip>;
export declare const listDocumentsResponse: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        draftData: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        publishedData: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        _meta: z.ZodOptional<z.ZodObject<{
            status: z.ZodEnum<{
                draft: "draft";
                published: "published";
                unpublished: "unpublished";
            }>;
            publishedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            updatedAt: z.ZodOptional<z.ZodString>;
            createdAt: z.ZodOptional<z.ZodString>;
            publishedHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            draftHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            revision: z.ZodOptional<z.ZodNumber>;
        }, z.core.$loose>>;
    }, z.core.$loose>>;
    pagination: z.ZodObject<{
        total: z.ZodNumber;
        page: z.ZodNumber;
        pageSize: z.ZodNumber;
        totalPages: z.ZodNumber;
        hasNextPage: z.ZodBoolean;
        hasPrevPage: z.ZodBoolean;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const getDocumentsByIdsQuery: z.ZodObject<{
    ids: z.ZodPipe<z.ZodString, z.ZodTransform<string[], string>>;
}, z.core.$strip>;
export declare const createDocumentRequest: z.ZodObject<{
    type: z.ZodString;
    draftData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    publish: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const createDocumentResponse: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        draftData: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        publishedData: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        _meta: z.ZodOptional<z.ZodObject<{
            status: z.ZodEnum<{
                draft: "draft";
                published: "published";
                unpublished: "unpublished";
            }>;
            publishedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            updatedAt: z.ZodOptional<z.ZodString>;
            createdAt: z.ZodOptional<z.ZodString>;
            publishedHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            draftHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            revision: z.ZodOptional<z.ZodNumber>;
        }, z.core.$loose>>;
    }, z.core.$loose>;
    validation: z.ZodOptional<z.ZodUnknown>;
}, z.core.$strip>;
export declare const getDocumentResponse: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        draftData: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        publishedData: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        _meta: z.ZodOptional<z.ZodObject<{
            status: z.ZodEnum<{
                draft: "draft";
                published: "published";
                unpublished: "unpublished";
            }>;
            publishedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            updatedAt: z.ZodOptional<z.ZodString>;
            createdAt: z.ZodOptional<z.ZodString>;
            publishedHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            draftHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            revision: z.ZodOptional<z.ZodNumber>;
        }, z.core.$loose>>;
    }, z.core.$loose>;
}, z.core.$strip>;
export declare const updateDocumentRequest: z.ZodObject<{
    draftData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    publish: z.ZodOptional<z.ZodBoolean>;
    expectedRevision: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const updateDocumentResponse: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        draftData: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        publishedData: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        _meta: z.ZodOptional<z.ZodObject<{
            status: z.ZodEnum<{
                draft: "draft";
                published: "published";
                unpublished: "unpublished";
            }>;
            publishedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            updatedAt: z.ZodOptional<z.ZodString>;
            createdAt: z.ZodOptional<z.ZodString>;
            publishedHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            draftHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            revision: z.ZodOptional<z.ZodNumber>;
        }, z.core.$loose>>;
    }, z.core.$loose>;
    validation: z.ZodOptional<z.ZodUnknown>;
}, z.core.$strip>;
export declare const deleteDocumentResponse: z.ZodObject<{
    success: z.ZodLiteral<true>;
    message: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const publishDocumentRequest: z.ZodObject<{
    expectedRevision: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const publishDocumentResponse: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        draftData: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        publishedData: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        _meta: z.ZodOptional<z.ZodObject<{
            status: z.ZodEnum<{
                draft: "draft";
                published: "published";
                unpublished: "unpublished";
            }>;
            publishedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            updatedAt: z.ZodOptional<z.ZodString>;
            createdAt: z.ZodOptional<z.ZodString>;
            publishedHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            draftHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            revision: z.ZodOptional<z.ZodNumber>;
        }, z.core.$loose>>;
    }, z.core.$loose>;
    message: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const unpublishDocumentRequest: z.ZodObject<{
    expectedRevision: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const unpublishDocumentResponse: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        draftData: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        publishedData: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        _meta: z.ZodOptional<z.ZodObject<{
            status: z.ZodEnum<{
                draft: "draft";
                published: "published";
                unpublished: "unpublished";
            }>;
            publishedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            updatedAt: z.ZodOptional<z.ZodString>;
            createdAt: z.ZodOptional<z.ZodString>;
            publishedHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            draftHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            revision: z.ZodOptional<z.ZodNumber>;
        }, z.core.$loose>>;
    }, z.core.$loose>;
    message: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const queryDocumentsRequest: z.ZodObject<{
    type: z.ZodString;
    where: z.ZodOptional<z.ZodUnknown>;
    select: z.ZodOptional<z.ZodUnknown>;
    sort: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodArray<z.ZodString>]>>;
    page: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    pageSize: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    depth: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    perspective: z.ZodOptional<z.ZodEnum<{
        draft: "draft";
        published: "published";
    }>>;
    includeChildOrganizations: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export type QueryDocumentsRequest = z.infer<typeof queryDocumentsRequest>;
export declare const listVersionsQuery: z.ZodObject<{
    limit: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const documentVersionSchema: z.ZodObject<{
    id: z.ZodString;
    documentId: z.ZodString;
    organizationId: z.ZodString;
    versionNumber: z.ZodNumber;
    eventType: z.ZodEnum<{
        draft: "draft";
        publish: "publish";
        restore: "restore";
    }>;
    data: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    createdBy: z.ZodNullable<z.ZodString>;
    createdByName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    createdAt: z.ZodNullable<z.ZodUnion<readonly [z.ZodString, z.ZodDate]>>;
}, z.core.$loose>;
export declare const listVersionsResponse: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        documentId: z.ZodString;
        organizationId: z.ZodString;
        versionNumber: z.ZodNumber;
        eventType: z.ZodEnum<{
            draft: "draft";
            publish: "publish";
            restore: "restore";
        }>;
        data: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        createdBy: z.ZodNullable<z.ZodString>;
        createdByName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        createdAt: z.ZodNullable<z.ZodUnion<readonly [z.ZodString, z.ZodDate]>>;
    }, z.core.$loose>>;
    total: z.ZodNumber;
}, z.core.$strip>;
export declare const getVersionResponse: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<{
        id: z.ZodString;
        documentId: z.ZodString;
        organizationId: z.ZodString;
        versionNumber: z.ZodNumber;
        eventType: z.ZodEnum<{
            draft: "draft";
            publish: "publish";
            restore: "restore";
        }>;
        data: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        createdBy: z.ZodNullable<z.ZodString>;
        createdByName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        createdAt: z.ZodNullable<z.ZodUnion<readonly [z.ZodString, z.ZodDate]>>;
    }, z.core.$loose>;
}, z.core.$strip>;
export declare const restoreVersionRequest: z.ZodObject<{
    expectedRevision: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const restoreVersionResponse: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        draftData: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        publishedData: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        _meta: z.ZodOptional<z.ZodObject<{
            status: z.ZodEnum<{
                draft: "draft";
                published: "published";
                unpublished: "unpublished";
            }>;
            publishedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            updatedAt: z.ZodOptional<z.ZodString>;
            createdAt: z.ZodOptional<z.ZodString>;
            publishedHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            draftHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            revision: z.ZodOptional<z.ZodNumber>;
        }, z.core.$loose>>;
    }, z.core.$loose>;
    message: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const discardDraftRequest: z.ZodObject<{
    expectedRevision: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const discardDraftResponse: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        draftData: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        publishedData: z.ZodOptional<z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>>;
        _meta: z.ZodOptional<z.ZodObject<{
            status: z.ZodEnum<{
                draft: "draft";
                published: "published";
                unpublished: "unpublished";
            }>;
            publishedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            updatedAt: z.ZodOptional<z.ZodString>;
            createdAt: z.ZodOptional<z.ZodString>;
            publishedHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            draftHash: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            revision: z.ZodOptional<z.ZodNumber>;
        }, z.core.$loose>>;
    }, z.core.$loose>;
    validation: z.ZodOptional<z.ZodUnknown>;
}, z.core.$strip>;
export declare const scheduleDocumentRequest: z.ZodObject<{
    action: z.ZodEnum<{
        publish: "publish";
        unpublish: "unpublish";
    }>;
    runAt: z.ZodString;
}, z.core.$strip>;
export declare const scheduleDocumentResponse: z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<{
        jobId: z.ZodString;
        type: z.ZodString;
        runAt: z.ZodString;
        status: z.ZodString;
    }, z.core.$strip>;
    message: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type DocumentDTO = z.infer<typeof documentSchema>;
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;
export type ListDocumentsQuery = z.input<typeof listDocumentsQuery>;
export type ListDocumentsResponse = z.infer<typeof listDocumentsResponse>;
export type CreateDocumentRequest = z.infer<typeof createDocumentRequest>;
export type CreateDocumentResponse = z.infer<typeof createDocumentResponse>;
export type GetDocumentResponse = z.infer<typeof getDocumentResponse>;
export type UpdateDocumentRequest = z.infer<typeof updateDocumentRequest>;
export type UpdateDocumentResponse = z.infer<typeof updateDocumentResponse>;
export type DeleteDocumentResponse = z.infer<typeof deleteDocumentResponse>;
export type PublishDocumentRequest = z.infer<typeof publishDocumentRequest>;
export type PublishDocumentResponse = z.infer<typeof publishDocumentResponse>;
export type UnpublishDocumentRequest = z.infer<typeof unpublishDocumentRequest>;
export type UnpublishDocumentResponse = z.infer<typeof unpublishDocumentResponse>;
export type ScheduleDocumentRequest = z.infer<typeof scheduleDocumentRequest>;
export type ScheduleDocumentResponse = z.infer<typeof scheduleDocumentResponse>;
export type DocumentVersion = z.infer<typeof documentVersionSchema>;
export type ListVersionsQuery = z.input<typeof listVersionsQuery>;
export type ListVersionsResponse = z.infer<typeof listVersionsResponse>;
export type GetVersionResponse = z.infer<typeof getVersionResponse>;
export type RestoreVersionRequest = z.infer<typeof restoreVersionRequest>;
export type RestoreVersionResponse = z.infer<typeof restoreVersionResponse>;
//# sourceMappingURL=documents.d.ts.map
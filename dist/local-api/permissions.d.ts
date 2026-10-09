import type { LocalAPIContext } from './types.js';
import type { SchemaType } from '../types/schemas.js';
import type { Document } from '../types/document.js';
import type { CMSConfig } from '../types/config.js';
export declare class PermissionError extends Error {
    readonly operation: string;
    readonly resource: string;
    constructor(message: string, operation: string, resource: string);
}
export declare class PermissionChecker {
    private _config;
    private schemas;
    constructor(_config: CMSConfig, schemas: Map<string, SchemaType>);
    get config(): CMSConfig;
    canRead(context: LocalAPIContext, collectionName: string, doc?: Document): Promise<void>;
    canCreate(context: LocalAPIContext, collectionName: string): Promise<void>;
    canUpdate(context: LocalAPIContext, collectionName: string, doc?: Document): Promise<void>;
    /**
     * @deprecated Prefer `canCreate` or `canUpdate` — this method conflates the
     * two and was only kept for legacy call sites. It now aliases `canUpdate`
     * for safety (update is the more restrictive default for mutation).
     */
    canWrite(context: LocalAPIContext, collectionName: string, doc?: Document): Promise<void>;
    canDelete(context: LocalAPIContext, collectionName: string, doc?: Document): Promise<void>;
    canPublish(context: LocalAPIContext, collectionName: string, doc?: Document): Promise<void>;
    canUnpublish(context: LocalAPIContext, collectionName: string, doc?: Document): Promise<void>;
    validateCollection(collectionName: string): void;
    private assert;
    private logDenial;
    private requireAuth;
    /**
     * Evaluate an access rule for a given operation.
     *
     * Three kinds of declared rules:
     *   - `OrganizationRole[]` — role allowlist (as before).
     *   - `(ctx) => boolean` — arbitrary policy, receives auth + optional doc.
     *     Use for ownership rules like `doc.createdBy === auth.user.id`.
     *   - `undefined` — fall back to capability check.
     *
     * A declared-but-excluded role/policy for a session caller is an explicit
     * deny; the capability map does not re-grant access.
     */
    private isAllowed;
}
//# sourceMappingURL=permissions.d.ts.map
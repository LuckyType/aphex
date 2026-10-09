/**
 * Deterministic UUID-shaped id for a singleton schema, scoped to a specific
 * organization. Each org gets its own canonical row id, so multi-tenant
 * deployments don't collide on the global `documents.id` primary key. Same
 * (schemaName, organizationId) always resolves to the same id, so the
 * singleton document survives across deploys.
 *
 * The hash is not cryptographic — collision space is the (org, schema-name)
 * set, which is small enough that FNV-1a is more than sufficient.
 */
export declare function singletonId(schemaName: string, organizationId: string): string;
//# sourceMappingURL=singleton.d.ts.map
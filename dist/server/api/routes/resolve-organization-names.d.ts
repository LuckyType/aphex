import type { DatabaseAdapter } from '../../../db/interfaces/index.js';
/**
 * Resolve `organizationId` on a list of rows to the organization's name.
 *
 * Only needed by the instance-wide history views, where rows from several tenants sit in one
 * table and a bare uuid tells a super admin nothing about which customer is affected. The
 * org-scoped views skip this entirely — every row belongs to the org you're already in.
 *
 * Lookups are deduped and run in parallel; an org that can't be read resolves to `null`
 * rather than failing the page, since a missing name is cosmetic and a 500 is not.
 */
export declare function withOrganizationNames<T extends {
    organizationId: string;
}>(rows: T[], db: DatabaseAdapter): Promise<Array<T & {
    organizationName: string | null;
}>>;
//# sourceMappingURL=resolve-organization-names.d.ts.map
import type { CMSConfig } from './types/config.js';
import type { SchemaType } from './types/schemas.js';
import type { DatabaseAdapter } from './db/interfaces/index.js';
export declare class CMSEngine {
    private db;
    config: CMSConfig;
    constructor(config: CMSConfig, dbAdapter: DatabaseAdapter);
    updateConfig(newConfig: CMSConfig): void;
    initialize(): Promise<void>;
    /**
     * Every capability this install recognises: core's built-ins plus whatever the
     * registered plugins declare.
     *
     * `ALL_CAPABILITIES` is core-only and static, so on its own it would leave an
     * owner unable to hold a capability its own plugins declared — owner would end up
     * with strictly fewer permissions than admin, who can be granted plugin
     * capabilities through the roles UI.
     */
    ownerCapabilities(): string[];
    /**
     * Re-seed built-in roles for every existing organization.
     *
     * Org creation seeds roles once, which means an org created before a
     * capability existed never learns about it — that is why an owner could be
     * missing `plugin.settings.manage` after upgrading core. Re-seeding on boot
     * closes that gap: it inserts any missing built-in row and reconciles `owner`
     * back to the full capability set, which now includes plugin-declared
     * capabilities. Editable roles (admin/editor/viewer) are left as the operator
     * configured them.
     *
     * Because this runs on every boot, installing or removing a plugin is enough to
     * bring owners in line with the capabilities that plugin declares.
     *
     * Idempotent and cheap — orgs are few and this is four rows each — so it runs
     * unconditionally rather than behind a schema-version check.
     */
    private reconcileBuiltinRoles;
    getSchemaType(name: string): Promise<SchemaType | null>;
    listSchemas(): Promise<SchemaType[]>;
    getSchemaTypeByName(name: string): SchemaType | null;
    listDocumentTypes(): Promise<Array<{
        name: string;
        title: string;
        description?: string;
    }>>;
    listObjectTypes(): Promise<Array<{
        name: string;
        title: string;
        description?: string;
    }>>;
}
export declare function createCMS(config: CMSConfig, dbAdapter: DatabaseAdapter): CMSEngine;
export declare function getCMS(): CMSEngine;
//# sourceMappingURL=engine.d.ts.map
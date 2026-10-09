import type { AdminArea } from './types.js';
/** The known admin URL params. Central list so intents never typo a key. */
export type AdminParam = 'view' | 'docType' | 'docId' | 'action' | 'stack' | 'history' | 'focus' | 'orgId' | 'fromDocId' | 'fromDocType';
/** A set of param changes: a value sets the key, `null` clears it. */
export type ParamPatch = Partial<Record<AdminParam, string | null>>;
export interface AdminNav {
    /** Apply a param patch and navigate. `replace` defaults to true. */
    patch(changes: ParamPatch, opts?: {
        replace?: boolean;
    }): Promise<void>;
    /** Switch the top-level area/tab. `structure` clears `?view`; others set it. */
    openArea(area: AdminArea): Promise<void>;
    /** Show a document type's list (structure area). */
    openType(docType: string): Promise<void>;
    /**
     * Open a document in the editor (structure area). `docType` is optional — when
     * omitted the existing `?docType` is preserved (the URL effect resolves it).
     */
    openDocument(docId: string, docType?: string, opts?: {
        replace?: boolean;
    }): Promise<void>;
    /** Start creating a new document of a type. */
    createDocument(docType: string): Promise<void>;
    /** Close the current document, back to its type's list. */
    closeToType(docType: string): Promise<void>;
    /** Back to the dashboard (no type, no doc). */
    goHome(): Promise<void>;
}
/** Create an admin nav and publish it to descendants (call once in the shell). */
export declare function setAdminNav(basePath?: string): AdminNav;
/** Read the admin nav. `undefined` outside the admin shell (safe to guard). */
export declare function useAdminNav(): AdminNav | undefined;
export declare function createAdminNav(basePath?: string): AdminNav;
//# sourceMappingURL=nav.svelte.d.ts.map
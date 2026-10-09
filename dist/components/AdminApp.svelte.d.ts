import type { SchemaType } from '../types/index.js';
import type { CMSPlugin } from '../plugins/types.js';
import type { AdminArea } from '../admin/types.js';
import type { Component } from 'svelte';
import { type BlockPreviewProps } from '../admin/block-previews.svelte.js';
import type { UserSessionPreferences } from '../types/organization.js';
interface Props {
    schemas: SchemaType[];
    documentTypes: Array<{
        name: string;
        title: string;
        description?: string;
    }>;
    schemaError?: {
        message: string;
    } | null;
    title?: string;
    tabTitle?: string;
    graphqlSettings?: {
        endpoint: string;
        enableGraphiQL: boolean;
    } | null;
    isReadOnly?: boolean;
    /**
     * Capabilities resolved for the current session. Used for per-action UI
     * gating. When absent, all actions are shown and the server remains the
     * enforcement surface.
     */
    capabilities?: string[];
    /** Effective organization role name, for role-list style checks. */
    rbacRole?: string | null;
    activeTab?: {
        value: AdminArea;
    };
    handleTabChange: (value: string) => void;
    userPreferences?: UserSessionPreferences | null;
    /**
     * Build-time plugins, imported client-side (component parts can't cross
     * SvelteKit `load`). Their document-action parts render in the editor toolbar.
     */
    plugins?: CMSPlugin[];
    /**
     * Inline editor previews for custom rich-text block types, keyed by `_type`.
     * Without one, a block renders as a generic card (title/subtitle from its
     * `preview` config); with one, the real block renders inline as you write.
     * App-owned on purpose — the app owns presentation.
     */
    blockPreviews?: Record<string, Component<BlockPreviewProps>>;
}
declare const AdminApp: Component<Props, {}, "">;
type AdminApp = ReturnType<typeof AdminApp>;
export default AdminApp;
//# sourceMappingURL=AdminApp.svelte.d.ts.map
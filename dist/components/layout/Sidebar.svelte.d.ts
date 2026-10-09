import type { SidebarData } from '../../types/sidebar.js';
import type { AdminArea } from '../../admin/types.js';
import type { CMSPlugin } from '../../plugins/types.js';
type Props = {
    data: SidebarData;
    onSignOut?: () => void | Promise<void>;
    children: any;
    enableGraphiQL?: boolean;
    enableAssistant?: boolean;
    activeTab?: {
        value: AdminArea;
    };
    onTabChange?: (value: string) => void;
    /** Plugin registry — used to render sidebar-placed admin tools as persistent nav. */
    plugins?: CMSPlugin[];
    /**
     * The element around the Studio's content. `div` for an app whose own
     * layout already renders the page's one `main` landmark.
     */
    contentElement?: 'main' | 'div';
};
declare const Sidebar: import("svelte").Component<Props, {}, "">;
type Sidebar = ReturnType<typeof Sidebar>;
export default Sidebar;
//# sourceMappingURL=Sidebar.svelte.d.ts.map
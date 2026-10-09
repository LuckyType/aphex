import { Sidebar } from '@aphexcms/ui/shadcn/sidebar';
import type { SidebarData } from '../../../types/sidebar.js';
import type { ComponentProps } from 'svelte';
import type { AdminToolPart } from '../../../plugins/types.js';
type Props = ComponentProps<typeof Sidebar> & {
    data: SidebarData;
    onSignOut?: () => void | Promise<void>;
    /** Sidebar-placed plugin admin tools, already capability-filtered. */
    sidebarTools?: AdminToolPart[];
    /** Open a tool's `plugin:<id>` area (navigates to /admin if elsewhere). */
    onSelectTool?: (id: string) => void;
};
declare const AppSidebar: import("svelte").Component<Props, {}, "">;
type AppSidebar = ReturnType<typeof AppSidebar>;
export default AppSidebar;
//# sourceMappingURL=AppSidebar.svelte.d.ts.map
import { type IconProps } from '@lucide/svelte';
import type { Component } from 'svelte';
import type { AdminToolPart } from '../../../plugins/types.js';
export type NavGroupItem = {
    title: string;
    url: string;
    icon?: Component<IconProps>;
    isActive?: boolean;
    exact?: boolean;
    /** Leaves the studio — open in a new tab and never light up as active. */
    newTab?: boolean;
    items?: {
        title: string;
        url: string;
    }[];
};
type Props = {
    items: NavGroupItem[];
    label?: string;
    /** `'bottom'` is the utility tier: pinned down, one size smaller. */
    placement?: 'top' | 'bottom';
    /** Plugin admin tools filed into this group. Rendered after the nav items. */
    tools?: AdminToolPart[];
    isActive?: (item: NavGroupItem) => boolean;
    isToolActive?: (id: string) => boolean;
    onSelectTool?: (id: string) => void;
    /** See SidebarNavGroup.collapsible. */
    collapsible?: boolean;
};
declare const NavGroup: Component<Props, {}, "">;
type NavGroup = ReturnType<typeof NavGroup>;
export default NavGroup;
//# sourceMappingURL=NavGroup.svelte.d.ts.map
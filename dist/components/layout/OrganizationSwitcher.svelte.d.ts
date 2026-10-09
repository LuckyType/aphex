import type { SidebarOrganization } from '../../types/sidebar.js';
type Props = {
    organizations?: SidebarOrganization[];
    activeOrganization?: SidebarOrganization;
    canCreateOrganization?: boolean;
    onOpenChange?: (open: boolean) => void;
};
declare const OrganizationSwitcher: import("svelte").Component<Props, {}, "">;
type OrganizationSwitcher = ReturnType<typeof OrganizationSwitcher>;
export default OrganizationSwitcher;
//# sourceMappingURL=OrganizationSwitcher.svelte.d.ts.map
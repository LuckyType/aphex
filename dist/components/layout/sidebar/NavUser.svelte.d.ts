import type { SidebarUser } from '../../../types/sidebar.js';
type Props = {
    user: SidebarUser;
    onSignOut?: () => void | Promise<void>;
};
declare const NavUser: import("svelte").Component<Props, {}, "">;
type NavUser = ReturnType<typeof NavUser>;
export default NavUser;
//# sourceMappingURL=NavUser.svelte.d.ts.map
import type { Snippet } from 'svelte';
import { type AdminSlotName } from '../../admin/slots.svelte.js';
type Props = {
    name: AdminSlotName;
    id: string;
    order?: number;
    children: Snippet;
};
declare const AdminSlot: import("svelte").Component<Props, {}, "">;
type AdminSlot = ReturnType<typeof AdminSlot>;
export default AdminSlot;
//# sourceMappingURL=AdminSlot.svelte.d.ts.map
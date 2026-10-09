interface Props {
    open: boolean;
    documentId: string;
    /**
     * The action to schedule. Derived from the editor's active perspective by the caller:
     * viewing the Draft tab → 'publish' (send this draft live later); viewing the Published
     * tab → 'unpublish' (take it down later). No in-dialog toggle — the tab is the intent.
     */
    action: 'publish' | 'unpublish';
    onScheduled?: (job: {
        jobId: string;
        type: string;
        runAt: string;
        status: string;
    }) => void;
}
declare const ScheduleDialog: import("svelte").Component<Props, {}, "open">;
type ScheduleDialog = ReturnType<typeof ScheduleDialog>;
export default ScheduleDialog;
//# sourceMappingURL=ScheduleDialog.svelte.d.ts.map
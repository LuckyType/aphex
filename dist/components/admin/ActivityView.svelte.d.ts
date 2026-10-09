type Props = {
    /**
     * May the viewer retry/cancel jobs? `org.settings` — see `requireJobControl` in the
     * route. Gating here only hides buttons; the server is what enforces it.
     */
    canControlJobs?: boolean;
    /** Super admins can widen jobs/events past their active organization (`?scope=all`). */
    isSuperAdmin?: boolean;
};
declare const ActivityView: import("svelte").Component<Props, {}, "">;
type ActivityView = ReturnType<typeof ActivityView>;
export default ActivityView;
//# sourceMappingURL=ActivityView.svelte.d.ts.map
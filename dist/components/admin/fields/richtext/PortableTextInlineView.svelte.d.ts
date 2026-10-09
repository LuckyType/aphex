interface Props {
    type: string;
    nodeKey: string;
    data: Record<string, unknown>;
    selected: boolean;
    onEdit: () => void;
    onDelete: () => void;
}
declare const PortableTextInlineView: import("svelte").Component<Props, {}, "">;
type PortableTextInlineView = ReturnType<typeof PortableTextInlineView>;
export default PortableTextInlineView;
//# sourceMappingURL=PortableTextInlineView.svelte.d.ts.map
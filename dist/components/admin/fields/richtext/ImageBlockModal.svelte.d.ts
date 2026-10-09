interface Props {
    open: boolean;
    assetRef?: string;
    alt: string;
    readonly?: boolean;
    onAltChange: (alt: string) => void;
    onReplace: () => void;
    onRemove: () => void;
    onClose: () => void;
}
declare const ImageBlockModal: import("svelte").Component<Props, {}, "">;
type ImageBlockModal = ReturnType<typeof ImageBlockModal>;
export default ImageBlockModal;
//# sourceMappingURL=ImageBlockModal.svelte.d.ts.map
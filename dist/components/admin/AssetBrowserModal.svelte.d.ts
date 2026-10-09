import type { Asset } from '../../types/asset.js';
import type { AcceptedFileTypes } from '../../utils/file-accept.js';
interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect?: (asset: Asset) => void;
    /** Complete set of selected asset IDs across all pages (see MediaBrowser). */
    onSelectMultiple?: (assetIds: string[]) => void;
    multiSelect?: boolean;
    assetTypeFilter?: 'image' | 'file';
    accept?: AcceptedFileTypes;
    /** Asset IDs already in use (shown with a tick in the browser) */
    existingAssetIds?: Set<string>;
    /**
     * The field that opened this picker. Passed through so an upload made from
     * inside a private field inherits that field's privacy — see MediaBrowser.
     */
    schemaType?: string;
    fieldPath?: string;
}
declare const AssetBrowserModal: import("svelte").Component<Props, {}, "open">;
type AssetBrowserModal = ReturnType<typeof AssetBrowserModal>;
export default AssetBrowserModal;
//# sourceMappingURL=AssetBrowserModal.svelte.d.ts.map
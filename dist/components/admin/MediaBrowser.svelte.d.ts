import type { Asset } from '../../types/asset.js';
import { type AcceptedFileTypes } from '../../utils/file-accept.js';
interface Props {
    /** When true, shows a "Select" button for picking an asset */
    selectable?: boolean;
    /** When true, allows selecting multiple assets (used with selectable) */
    multiSelect?: boolean;
    /** Callback when an asset is selected (single select mode) */
    onSelect?: (asset: Asset) => void;
    /** Callback when multiple assets are selected (multi select mode) */
    /**
     * Confirmed multi-selection, as the complete set of selected asset IDs —
     * across every page, not just the visible one. Treat it as the desired
     * final state: anything absent was deselected.
     */
    onSelectMultiple?: (assetIds: string[]) => void;
    /** Filter to specific asset type */
    assetTypeFilter?: 'image' | 'file';
    /** MIME types/extensions accepted by the field that opened this picker. */
    accept?: AcceptedFileTypes;
    /** Number of assets per page */
    pageSize?: number;
    /** Whether this tab is currently active (triggers refetch when becoming active) */
    active?: boolean;
    /** Asset IDs already in use (shown with a tick indicator) */
    existingAssetIds?: Set<string>;
    /**
     * Asset to open on mount, addressed by id.
     *
     * Looked up on its own rather than searched for in the current page: a
     * deep-linked asset is usually *not* on page 1 — that's why someone
     * linked to it — so filtering the loaded list would silently do nothing
     * for exactly the assets this exists to reach.
     */
    assetId?: string | null;
    /**
     * Fires when the open asset changes (null when the panel closes), so the
     * host can reflect it in the URL. The component holds no opinion about
     * routing; it only reports.
     */
    onAssetOpen?: (assetId: string | null) => void;
    /**
     * The field this browser was opened from, when it was opened as a picker.
     *
     * Recorded on anything uploaded here, because it is what the media route
     * later reads to decide whether the asset is private: privacy is declared
     * on the field (`private: true`), and resolved from the field an asset was
     * uploaded into. Without it, everything uploaded through the library is
     * public regardless of where it is used — which was the case for every
     * library upload until now.
     *
     * Absent when the library is opened as a destination in its own right (the
     * Media tab), where there is no field to inherit from.
     */
    schemaType?: string;
    fieldPath?: string;
}
declare const MediaBrowser: import("svelte").Component<Props, {}, "">;
type MediaBrowser = ReturnType<typeof MediaBrowser>;
export default MediaBrowser;
//# sourceMappingURL=MediaBrowser.svelte.d.ts.map
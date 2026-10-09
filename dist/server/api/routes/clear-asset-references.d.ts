import type { DatabaseAdapter } from '../../../db/index.js';
/**
 * Strip a deleted asset's references out of document data.
 *
 * Shared by the single and bulk delete routes so they can't drift: bulk delete
 * previously skipped this entirely, so a batch delete left every reference
 * behind while an identical single delete cleaned up.
 *
 * The adapter method is optional, so a third-party adapter that doesn't
 * implement it degrades to "references stay behind" rather than failing the
 * delete. That is survivable because asset resolution is null-safe — an
 * unresolved `_ref` renders as nothing rather than throwing.
 *
 * Never throws: the asset is already gone by the time this runs, so a cleanup
 * failure must not turn a successful delete into a 500.
 */
export declare function clearAssetReferences(databaseAdapter: DatabaseAdapter, organizationId: string, assetId: string): Promise<void>;
//# sourceMappingURL=clear-asset-references.d.ts.map
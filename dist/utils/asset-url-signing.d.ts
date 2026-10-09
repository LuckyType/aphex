/** Query parameter names, kept in one place since both halves must agree. */
export declare const ASSET_SIGNATURE_PARAM = "sig";
export declare const ASSET_EXPIRY_PARAM = "exp";
/** 15 minutes. Long enough to load a page and start a download, short enough that a leaked link dies. */
export declare const DEFAULT_ASSET_URL_TTL_SECONDS = 900;
export interface SignedAssetUrlOptions {
    /** Seconds the link stays valid. Defaults to {@link DEFAULT_ASSET_URL_TTL_SECONDS}. */
    expiresIn?: number;
    /** Overrides "now" — for tests, and for minting a link that starts later. */
    now?: Date;
}
/**
 * Append a signature and expiry to a `/media/...` path.
 *
 * Returns the path unchanged when no secret is configured. That is the safe
 * direction: an unsigned URL to a private asset is refused by the route, so a
 * missing secret costs access rather than granting it.
 */
export declare function signAssetUrl(secret: string | undefined, url: string, assetId: string, options?: SignedAssetUrlOptions): string;
/**
 * Whether this request carries a valid, unexpired signature for this asset.
 *
 * Every failure returns `false` rather than throwing or distinguishing itself:
 * a caller learning *why* a signature was rejected learns something about the
 * secret. The route treats false exactly as it treats no signature at all.
 */
export declare function verifyAssetSignature(secret: string | undefined, params: URLSearchParams, assetId: string, now?: Date): boolean;
//# sourceMappingURL=asset-url-signing.d.ts.map
/**
 * Whether it is worth pointing an `<img>` at this asset at all.
 *
 * An unknown type answers `true`: the request is the cheapest way to find out,
 * and a failed load falls back to the same placeholder anyway.
 */
export declare function browserCanDecodeImage(mimeType: string | null | undefined): boolean;
//# sourceMappingURL=image-support.d.ts.map
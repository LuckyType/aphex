/** The query param that marks a preview request (see `perspective.ts`). */
export const PREVIEW_QUERY_PARAM = 'aphex-preview';

/**
 * The preview iframe's address without the `?aphex-preview` marker, for the
 * Studio's URL bar. The iframe itself still loads with the marker, since that
 * is what lets an app resolve the draft perspective and enable the overlay;
 * the editor only stops showing an internal switch as part of the page's
 * address. Anything that is not a parseable absolute URL is returned as is.
 */
export function displayPreviewUrl(previewUrl: string): string {
	let u: URL;
	try {
		u = new URL(previewUrl);
	} catch {
		return previewUrl;
	}
	if (!u.searchParams.has(PREVIEW_QUERY_PARAM)) return previewUrl;
	u.searchParams.delete(PREVIEW_QUERY_PARAM);
	return u.toString();
}

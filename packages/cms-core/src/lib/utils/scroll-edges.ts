/**
 * Fades the edge of a sideways-scrolling row where more of it lies beyond
 * view. A tab bar with a hidden scrollbar otherwise gives no sign of the
 * tabs past its edge: on a phone the last ones simply were not there.
 *
 * Use as an attachment (`{@attach scrollEdges}`). It sets
 * `data-more-start` / `data-more-end` while there is more to scroll that
 * way, and a matching `mask-image`, re-measured on scroll and resize.
 */
export const SCROLL_EDGE_FADE = '2rem';

/** The mask for a row with more content before and/or after the view. */
export function scrollEdgeMask(moreStart: boolean, moreEnd: boolean): string {
	if (!moreStart && !moreEnd) return '';
	const start = moreStart ? `transparent, black ${SCROLL_EDGE_FADE}` : 'black';
	const end = moreEnd ? `black calc(100% - ${SCROLL_EDGE_FADE}), transparent` : 'black';
	return `linear-gradient(to right, ${start}, ${end})`;
}

export function scrollEdges(node: HTMLElement): () => void {
	function update() {
		// One pixel of slack: zoomed layouts report fractional widths.
		const moreStart = node.scrollLeft > 1;
		const moreEnd = node.scrollLeft + node.clientWidth < node.scrollWidth - 1;
		node.toggleAttribute('data-more-start', moreStart);
		node.toggleAttribute('data-more-end', moreEnd);
		const mask = scrollEdgeMask(moreStart, moreEnd);
		node.style.maskImage = mask;
		node.style.setProperty('-webkit-mask-image', mask);
	}

	update();
	node.addEventListener('scroll', update, { passive: true });
	const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
	observer?.observe(node);
	// Tabs coming and going change the content width without resizing the row.
	for (const child of node.children) observer?.observe(child);
	return () => {
		node.removeEventListener('scroll', update);
		observer?.disconnect();
	};
}

/**
 * Scrolls `tab` fully into its row and clear of the faded edges, as a click
 * on a half-hidden tab should: plain `scrollIntoView` stops at the row's
 * edge, under the fade. The browser clamps at either end, where no fade is.
 */
export function revealInRow(tab: Element | null): void {
	const row = tab?.parentElement;
	if (!tab || !row) return;
	const fade = Number.parseFloat(getComputedStyle(document.documentElement).fontSize || '16') * 2;
	const tabBox = tab.getBoundingClientRect();
	const rowBox = row.getBoundingClientRect();
	if (tabBox.right > rowBox.right - fade) row.scrollLeft += tabBox.right - rowBox.right + fade;
	else if (tabBox.left < rowBox.left + fade) row.scrollLeft -= rowBox.left + fade - tabBox.left;
}

// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { scrollEdgeMask, scrollEdges } from '../src/lib/utils/scroll-edges';

/** A row whose layout jsdom cannot compute, so its sizes are set by hand. */
function row(scrollWidth: number, clientWidth: number, scrollLeft = 0): HTMLElement {
	const node = document.createElement('div');
	Object.defineProperty(node, 'scrollWidth', { value: scrollWidth, configurable: true });
	Object.defineProperty(node, 'clientWidth', { value: clientWidth, configurable: true });
	node.scrollLeft = scrollLeft;
	return node;
}

describe('scrollEdgeMask', () => {
	it('fades only the edges with more beyond them', () => {
		expect(scrollEdgeMask(false, false)).toBe('');
		expect(scrollEdgeMask(false, true)).toBe(
			'linear-gradient(to right, black, black calc(100% - 2rem), transparent)'
		);
		expect(scrollEdgeMask(true, false)).toBe(
			'linear-gradient(to right, transparent, black 2rem, black)'
		);
		expect(scrollEdgeMask(true, true)).toContain('transparent, black 2rem');
	});
});

describe('scrollEdges', () => {
	it('marks a row whose tabs run past its end, and not one that fits', () => {
		const crowded = row(480, 390);
		const stop = scrollEdges(crowded);
		expect(crowded.hasAttribute('data-more-end')).toBe(true);
		expect(crowded.hasAttribute('data-more-start')).toBe(false);
		stop();

		const fits = row(390, 390);
		scrollEdges(fits)();
		expect(fits.hasAttribute('data-more-end')).toBe(false);
		expect(fits.style.maskImage).toBe('');
	});

	it('follows the row as it is scrolled to its end', () => {
		const node = row(480, 390);
		const stop = scrollEdges(node);
		node.scrollLeft = 90;
		node.dispatchEvent(new Event('scroll'));
		expect(node.hasAttribute('data-more-start')).toBe(true);
		expect(node.hasAttribute('data-more-end')).toBe(false);
		stop();
	});
});

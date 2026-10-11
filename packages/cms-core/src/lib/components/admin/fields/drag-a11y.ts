// dnd-kit speaks to screen readers in English and names an item by its id (a
// random `_key`). These replace its instructions and announcements with Studio
// text that names the position instead, so they follow `configureStudioI18n`.

import { Accessibility, type DragDropManagerInput } from '@dnd-kit/dom';
import * as i18n from '../../../i18n/index';

type Operation = { source: unknown; target?: unknown };

/** 1-based position of a sortable item (the only kind with an `index`), else undefined. */
function position(item: unknown): number | undefined {
	const index = (item as { index?: unknown } | null | undefined)?.index;
	return typeof index === 'number' ? index + 1 : undefined;
}

export function dragAnnouncements() {
	return {
		dragstart({ operation }: { operation: Operation }) {
			const at = position(operation.source);
			if (at === undefined) return;
			return i18n.t('Picked up item {position}.', { position: at });
		},
		dragover({ operation }: { operation: Operation }) {
			const at = position(operation.source);
			if (at === undefined || !operation.target) return;
			return i18n.t('Item moved to position {position}.', { position: at });
		},
		dragend({ operation, canceled }: { operation: Operation; canceled: boolean }) {
			const at = position(operation.source);
			if (at === undefined) return;
			return canceled
				? i18n.t('Moving cancelled. Item {position} stays where it was.', { position: at })
				: i18n.t('Item dropped at position {position}.', { position: at });
		}
	};
}

export function dragInstructions() {
	return {
		draggable: i18n.t(
			'To pick up an item, press the space bar. While dragging, use the arrow keys to move it. Press space again to drop it in its new position, or press escape to cancel.'
		)
	};
}

/** `plugins` for a `DragDropProvider`: the defaults, with Accessibility speaking Studio text. */
export const studioDragPlugins: DragDropManagerInput['plugins'] = (defaults) =>
	defaults.map((plugin) =>
		plugin === Accessibility
			? Accessibility.configure({
					announcements: dragAnnouncements() as never,
					screenReaderInstructions: dragInstructions()
				})
			: plugin
	);

import { afterEach, describe, expect, it } from 'vitest';
import { Accessibility, defaultPreset } from '@dnd-kit/dom';
import { configureStudioI18n } from '../src/lib/i18n/index';
import {
	dragAnnouncements,
	dragInstructions,
	studioDragPlugins
} from '../src/lib/components/admin/fields/drag-a11y';

afterEach(() => configureStudioI18n({}));

describe('studioDragPlugins', () => {
	it('keeps the default plugins and configures only Accessibility', () => {
		const plugins = (studioDragPlugins as (d: typeof defaultPreset.plugins) => unknown[])(
			defaultPreset.plugins
		);
		expect(plugins).toHaveLength(defaultPreset.plugins.length);
		expect(plugins).not.toContain(Accessibility);
		expect(plugins.slice(1)).toEqual(defaultPreset.plugins.slice(1));
	});
});

describe('drag announcements', () => {
	const source = { id: 'k3x9', index: 2 };

	it('name the position, not the random item key, in the configured language', () => {
		configureStudioI18n({
			messages: { 'Picked up item {position}.': 'Element {position} aufgenommen.' }
		});
		expect(dragAnnouncements().dragstart({ operation: { source } })).toBe('Element 3 aufgenommen.');
	});

	it('tell a drop from a cancel', () => {
		const a = dragAnnouncements();
		expect(a.dragend({ operation: { source }, canceled: false })).toBe(
			'Item dropped at position 3.'
		);
		expect(a.dragend({ operation: { source }, canceled: true })).toContain('cancelled');
	});

	it('stay silent for anything without a position', () => {
		expect(dragAnnouncements().dragstart({ operation: { source: { id: 'x' } } })).toBeUndefined();
	});

	it('give the instructions as Studio text', () => {
		configureStudioI18n({ messages: {} });
		expect(dragInstructions().draggable).toMatch(/^To pick up an item/);
	});
});

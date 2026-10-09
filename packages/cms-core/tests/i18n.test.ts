import { afterEach, describe, expect, it } from 'vitest';
import {
	configureStudioI18n,
	hour12,
	label,
	locale,
	plural,
	t,
	tn,
	tParts,
	validationMessage
} from '../src/lib/i18n/index';

describe('studio i18n', () => {
	afterEach(() => configureStudioI18n({}));

	it('falls back to the English source with its params filled in', () => {
		expect(t('Delete {name}?', { name: 'Home' })).toBe('Delete Home?');
		expect(t('Literal {{braces}}')).toBe('Literal {braces}');
		expect(locale()).toBeUndefined();
		expect(hour12()).toBeUndefined();
	});

	it('looks a source up in the catalog, context first', () => {
		configureStudioI18n({
			messages: { Cancel: 'Abbrechen', 'schedule|Cancel': 'Planung aufheben' }
		});
		expect(t('Cancel')).toBe('Abbrechen');
		expect(t('Cancel', undefined, 'schedule')).toBe('Planung aufheben');
		expect(t('Cancel', undefined, 'unknown')).toBe('Abbrechen');
	});

	it("picks the English form by count and a translation's form by its locale", () => {
		expect(tn(1, '{count} file', '{count} files')).toBe('1 file');
		expect(tn(3, '{count} file', '{count} files')).toBe('3 files');
		configureStudioI18n({
			locale: 'de',
			messages: { '{count} files': { one: '{count} Datei', other: '{count} Dateien' } }
		});
		expect(tn(1, '{count} file', '{count} files')).toBe('1 Datei');
		expect(tn(0, '{count} file', '{count} files')).toBe('0 Dateien');
	});

	it('splits a translation around a slot for markup', () => {
		configureStudioI18n({ messages: { 'Inspecting {title}': 'Rohdaten von {title}' } });
		expect(tParts('Inspecting {title}', 'title')).toEqual(['Rohdaten von ', '']);
		configureStudioI18n({});
		expect(tParts('Please select {field} first', 'field')).toEqual(['Please select ', ' first']);
	});

	it('hands labels, rule messages and plurals to the configured hooks', () => {
		const fallback = (title: string) => `${title}s`;
		expect(plural('Page', fallback)).toBe('Pages');
		configureStudioI18n({
			hourCycle: 24,
			label: (text) => `[${text}]`,
			validationMessage: (text) => text.toUpperCase(),
			plural: (title) => `${title}n`
		});
		expect(label('Title')).toBe('[Title]');
		expect(validationMessage('required')).toBe('REQUIRED');
		expect(plural('Seite', fallback)).toBe('Seiten');
		expect(hour12()).toBe(false);
	});
});

import { afterEach, describe, expect, it } from 'vitest';
import {
	configureStudioI18n,
	hour12,
	label,
	localizeSchema,
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

describe('localizeSchema', () => {
	afterEach(() => configureStudioI18n({}));

	const schema = {
		type: 'document' as const,
		name: 'page',
		title: 'Page',
		description: 'A page',
		groups: [{ name: 'seo', title: 'SEO' }],
		orderings: [{ name: 'byTitle', title: 'Title', by: [] }],
		lock: () => null,
		preview: { title: 'Settings', select: { subtitle: 'kind' } },
		fields: [
			{
				name: 'kind',
				type: 'string' as const,
				title: 'Kind',
				description: 'What it is',
				list: ['plain', { title: 'Landing', value: 'landing' }],
				validation: (rule: unknown) => rule
			},
			{
				name: 'tone',
				type: 'string' as const,
				title: 'Tone',
				list: { dependsOn: 'kind', options: { landing: [{ title: 'Loud', value: 'loud' }] } }
			},
			{
				name: 'layout',
				type: 'array' as const,
				title: 'Layout',
				of: [
					{
						type: 'hero',
						title: 'Hero',
						fields: [{ name: 'heading', type: 'string', title: 'Heading' }]
					},
					{
						type: 'block',
						styles: [{ title: 'Normal', value: 'normal' }],
						marks: { decorators: [{ title: 'Bold', value: 'strong' }] }
					}
				]
			}
		]
	};

	it('returns the schema itself when no label translator is configured', () => {
		expect(localizeSchema(schema)).toBe(schema);
	});

	it('translates every label an editor reads and keeps the rest by reference', () => {
		const de: Record<string, string> = {
			Page: 'Seite',
			'A page': 'Eine Seite',
			Kind: 'Art',
			'What it is': 'Was es ist',
			Landing: 'Einstieg',
			Loud: 'Laut',
			Layout: 'Aufbau',
			Hero: 'Held',
			Heading: 'Titel',
			Normal: 'Absatz',
			Bold: 'Fett',
			Title: 'Titel',
			Settings: 'Einstellungen'
		};
		configureStudioI18n({ label: (text) => de[text] ?? text });
		const out = localizeSchema(schema);
		expect(out).not.toBe(schema);
		expect(out.title).toBe('Seite');
		expect(out.description).toBe('Eine Seite');
		expect(out.groups[0]!.title).toBe('SEO');
		expect(out.orderings[0]!.title).toBe('Titel');
		expect(out.lock).toBe(schema.lock);
		expect(out.preview).toEqual({ title: 'Einstellungen', select: { subtitle: 'kind' } });
		const [kind, tone, layout] = out.fields as any[];
		expect(kind.title).toBe('Art');
		expect(kind.description).toBe('Was es ist');
		expect(kind.list).toEqual(['plain', { title: 'Einstieg', value: 'landing' }]);
		expect(kind.validation).toBe(schema.fields[0]!.validation);
		expect(tone.list.options.landing[0].title).toBe('Laut');
		expect(layout.title).toBe('Aufbau');
		expect(layout.of[0].title).toBe('Held');
		expect(layout.of[0].fields[0].title).toBe('Titel');
		expect(layout.of[1].styles[0].title).toBe('Absatz');
		expect(layout.of[1].marks.decorators[0].title).toBe('Fett');
		expect(schema.fields[0]!.title).toBe('Kind');
		expect(schema.preview.title).toBe('Settings');
	});

	it('leaves a preview without a literal title alone', () => {
		configureStudioI18n({ label: (text) => `de:${text}` });
		const prepare = () => ({ title: 'x' });
		const out = localizeSchema({ title: 'Item', preview: { prepare } });
		expect(out.preview.prepare).toBe(prepare);
		expect(out.preview).not.toHaveProperty('title');
	});
});

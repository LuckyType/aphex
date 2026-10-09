<script lang="ts">
	import * as i18n from '../../../i18n/index';
	import { Input } from '@aphexcms/ui/shadcn/input';
	import { Button } from '@aphexcms/ui/shadcn/button';
	import type { Field, SchemaType, SlugField } from '../../../types/schemas';
	import { generateSlug, slugSourceTitle } from '../../../utils/index';
	import { getSchemaContext } from '../../../schema-context.svelte';

	interface Props {
		field: SlugField;
		value: any;
		/** The whole document — where a root-level `source` field is found. */
		documentData?: Record<string, any>;
		/** The object this field lives in; `source`, like `dependsOn`, names a sibling. */
		siblingData?: Record<string, any>;
		/** The schema fields `siblingData` is shaped by — where `source`'s title is found. */
		siblingFields?: Field[];
		/** Document type, for the title of a root-level `source` field. */
		schemaType?: string;
		onUpdate: (value: any) => void;
		validationClasses?: string;
		onBlur?: (event: any) => void;
		onFocus?: (event: any) => void;
		readonly?: boolean;
	}

	let {
		field,
		value,
		documentData,
		siblingData,
		siblingFields,
		schemaType,
		onUpdate,
		validationClasses,
		onBlur,
		onFocus,
		readonly = false
	}: Props = $props();

	// Get the source field name (default to 'title' for backwards compatibility)
	const sourceField = $derived(field.source || 'title');

	// Own object scope first, document root second — same rule as a dependent list:
	// a slug inside an array item derives from that item's title, not the document's.
	const sourceValue = $derived(siblingData?.[sourceField] ?? documentData?.[sourceField]);

	// The document's schemas are only provided inside the editor; elsewhere the
	// label falls back to the sibling fields, then to the field name.
	let schemas: SchemaType[] = [];
	try {
		schemas = getSchemaContext();
	} catch {
		// No schema context: nothing to look up.
	}
	const sourceTitle = $derived(
		slugSourceTitle(
			sourceField,
			siblingFields,
			schemas.find((schema) => schema.name === schemaType)?.fields
		)
	);

	function handleInputChange(event: Event) {
		const target = event.target as HTMLInputElement;
		onUpdate(target.value);
	}

	// Generate slug from source field
	function generateSlugFromSource() {
		if (sourceValue && typeof sourceValue === 'string') {
			const generatedSlug = generateSlug(sourceValue);
			onUpdate(generatedSlug);
		}
	}
</script>

<div class="space-y-2">
	<div class="flex gap-2">
		<Input
			id={field.name}
			value={value || ''}
			placeholder={i18n.t('document-slug')}
			oninput={handleInputChange}
			onblur={onBlur}
			onfocus={onFocus}
			class="flex-1 {validationClasses}"
			disabled={readonly}
		/>
		<Button
			variant="outline"
			size="sm"
			onclick={generateSlugFromSource}
			disabled={!sourceValue || readonly}
			class="shrink-0"
		>
			{i18n.t('Generate')}
		</Button>
	</div>
	{#if readonly}
		<!-- No hint: the Generate button above is disabled, so there is nothing to click. -->
	{:else if sourceValue}
		<p class="text-muted-foreground text-xs">
			{i18n.t('Click "Generate" to create slug from {sourceField}: "{sourceValue}"', {
				sourceField: sourceTitle,
				sourceValue
			})}
		</p>
	{:else if field.source}
		<p class="text-muted-foreground text-xs">
			{i18n.t('Enter a {sourceField} first to generate a slug automatically', {
				sourceField: sourceTitle
			})}
		</p>
	{:else}
		<p class="text-muted-foreground text-xs">{i18n.t('Click "Generate" or enter a custom slug')}</p>
	{/if}
</div>

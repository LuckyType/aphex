<script lang="ts">
	import { Textarea } from '@aphexcms/ui/shadcn/textarea';
	import type { TextField } from '../../../types/schemas';

	interface Props {
		field: TextField;
		value: any;
		onUpdate: (value: any) => void;
		validationClasses?: string;
		invalid?: boolean;
		describedBy?: string;
		onBlur?: (event: any) => void;
		onFocus?: (event: any) => void;
		readonly?: boolean;
	}

	let {
		field,
		value,
		onUpdate,
		validationClasses,
		invalid = false,
		describedBy,
		onBlur,
		onFocus,
		readonly = false
	}: Props = $props();

	function handleInputChange(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		onUpdate(target.value);
	}
</script>

<Textarea
	id={field.name}
	value={value || ''}
	placeholder={field.placeholder}
	rows={field.rows}
	oninput={handleInputChange}
	onblur={onBlur}
	onfocus={onFocus}
	class="{field.rows ? 'field-sizing-fixed' : 'min-h-[100px]'} {validationClasses}"
	aria-invalid={invalid || undefined}
	aria-describedby={describedBy}
	disabled={readonly}
/>

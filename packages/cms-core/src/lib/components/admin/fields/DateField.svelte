<script lang="ts">
	import * as i18n from '../../../i18n/index';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import { type DateValue, parseDate } from '@internationalized/date';
	import { Input } from '@aphexcms/ui/shadcn/input';
	import Calendar from '../StudioCalendar.svelte';
	import * as Popover from '@aphexcms/ui/shadcn/popover';
	import type { DateField } from '../../../types/schemas';
	import { untrack } from 'svelte';
	import dayjs from 'dayjs';
	import customParseFormat from 'dayjs/plugin/customParseFormat';
	import { dateFormatHint, fieldDateFormat, parseDateInput } from '../../../utils/date-format';

	// Enable strict parsing
	dayjs.extend(customParseFormat);

	interface Props {
		field: DateField;
		value: string | null; // Always stored as ISO YYYY-MM-DD
		onUpdate: (value: string | null) => void;
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

	// The field's own format, else the Studio locale's (DD.MM.YYYY in German).
	const dateFormat = $derived(fieldDateFormat(field));

	// Track local input value for display
	let inputValue = $state('');

	// Show the stored ISO value in the display format. Text that already names
	// the stored day (typed as 5.3.26, say) stays as typed while focus is here;
	// leaving the field writes it out in full.
	$effect(() => {
		const format = dateFormat;
		if (!value || value === '') {
			if (inputValue !== '') inputValue = '';
			return;
		}
		const date = dayjs(value, 'YYYY-MM-DD', true);
		if (!date.isValid()) {
			// Not ISO: an unfinished or invalid entry, kept for validation to name.
			if (untrack(() => inputValue) !== value) inputValue = value;
			return;
		}
		if (untrack(() => parseDateInput(inputValue, format)) !== value) {
			inputValue = date.format(format);
		}
	});

	// Convert string value to DateValue for calendar
	const dateValue = $derived.by(() => {
		if (!value || value === '') return undefined;

		try {
			// Value is stored as ISO date string (YYYY-MM-DD)
			return parseDate(value);
		} catch {
			return undefined;
		}
	});

	// The month the calendar shows, set to the field's day each time it opens.
	let calendarMonth = $state<DateValue | undefined>(undefined);

	// Handle date selection from calendar
	function handleDateChange(newValue: DateValue | undefined) {
		if (!newValue) {
			onUpdate(null);
		} else {
			// Convert DateValue to ISO string (YYYY-MM-DD) for storage
			const isoString = newValue.toString();
			onUpdate(isoString);
		}
	}

	// Handle manual input changes
	function handleInputChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const displayValue = target.value;
		inputValue = displayValue;

		if (displayValue.trim() === '') {
			onUpdate(null);
			return;
		}

		const iso = parseDateInput(displayValue, dateFormat);
		// An unparsable entry is still written, so autosave keeps it and
		// validation names the format it expects.
		onUpdate(iso ?? displayValue);
	}

	function handleBlur(event: FocusEvent) {
		const iso = parseDateInput(inputValue, dateFormat);
		if (iso) inputValue = dayjs(iso, 'YYYY-MM-DD', true).format(dateFormat);
		onBlur?.(event);
	}
</script>

<div class="space-y-2">
	<div class="flex w-full gap-2">
		<Input
			id={field.name}
			type="text"
			placeholder={dateFormatHint(dateFormat)}
			value={inputValue}
			oninput={handleInputChange}
			onblur={handleBlur}
			onfocus={onFocus}
			class="flex-1 {validationClasses}"
			aria-invalid={invalid || undefined}
			aria-describedby={describedBy}
			disabled={readonly}
		/>
		<Popover.Root
			onOpenChange={(isOpen) => {
				if (isOpen) calendarMonth = dateValue;
			}}
		>
			<Popover.Trigger
				class="border-input bg-background ring-offset-background hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex h-10 w-10 items-center justify-center rounded-md border text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
				disabled={readonly}
				aria-label={i18n.t('Open calendar')}
			>
				<CalendarIcon class="h-4 w-4" aria-hidden="true" />
			</Popover.Trigger>
			<Popover.Content class="w-auto p-0">
				<Calendar
					type="single"
					value={dateValue}
					bind:placeholder={calendarMonth}
					onValueChange={handleDateChange}
					captionLayout="dropdown"
					locale={i18n.locale()}
				/>
			</Popover.Content>
		</Popover.Root>
	</div>
</div>

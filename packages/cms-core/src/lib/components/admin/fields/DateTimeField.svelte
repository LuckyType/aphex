<script lang="ts">
	import * as i18n from '../../../i18n/index';
	import TimeInput from './TimeInput.svelte';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import { type DateValue, parseDate } from '@internationalized/date';
	import { Input } from '@aphexcms/ui/shadcn/input';
	import { Button } from '@aphexcms/ui/shadcn/button';
	import Calendar from '../StudioCalendar.svelte';
	import * as Popover from '@aphexcms/ui/shadcn/popover';
	import type { DateTimeField } from '../../../types/schemas';
	import { untrack } from 'svelte';
	import dayjs from 'dayjs';
	import customParseFormat from 'dayjs/plugin/customParseFormat';
	import utc from 'dayjs/plugin/utc';
	import {
		dateFormatHint,
		fieldDateFormat,
		fieldTimeFormat,
		parseDateTimeInput
	} from '../../../utils/date-format';

	// Enable strict parsing and UTC
	dayjs.extend(customParseFormat);
	dayjs.extend(utc);

	interface Props {
		field: DateTimeField;
		value: string | null; // Always stored as ISO datetime UTC YYYY-MM-DDTHH:mm:ssZ
		onUpdate: (value: string | null) => void;
		validationClasses?: string;
		onBlur?: (event: any) => void;
		onFocus?: (event: any) => void;
		readonly?: boolean;
	}

	let {
		field,
		value,
		onUpdate,
		validationClasses,
		onBlur,
		onFocus,
		readonly = false
	}: Props = $props();

	// The field's own formats, else the Studio locale's (DD.MM.YYYY HH:mm in German).
	const dateFormat = $derived(fieldDateFormat(field));
	const timeFormat = $derived(fieldTimeFormat(field));
	const displayFormat = $derived(`${dateFormat} ${timeFormat}`);

	// Track local input value for display
	let inputValue = $state('');
	let timeValue = $state('00:00');

	/**
	 * The stored moment, read only from an ISO datetime: `Date` would read a
	 * half-typed "2" as February 2001 and overwrite the entry with it.
	 */
	function stored(text: string | null): dayjs.Dayjs | null {
		if (!text || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(text)) return null;
		const datetime = dayjs(text);
		return datetime.isValid() ? datetime : null;
	}

	function toStored(local: dayjs.Dayjs): string {
		return local.utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
	}

	// Show the stored value in the display format. Text that already names the
	// stored moment (typed as "24.12.26 18", say) stays as typed while focus is
	// here; leaving the field writes it out in full.
	$effect(() => {
		const [date, time, display] = [dateFormat, timeFormat, displayFormat];
		if (!value || value === '') {
			if (untrack(() => inputValue) !== '') {
				inputValue = '';
				timeValue = '00:00';
			}
			return;
		}
		const datetime = stored(value);
		if (!datetime) {
			// Not a datetime: an unfinished or invalid entry, kept for validation to name.
			if (untrack(() => inputValue) !== value) inputValue = value;
			return;
		}
		const typed = untrack(() => parseDateTimeInput(inputValue, date, time));
		if (!typed || toStored(typed) !== toStored(datetime)) {
			inputValue = datetime.format(display);
		}
		const pickerTime = datetime.format('HH:mm');
		if (untrack(() => timeValue) !== pickerTime) timeValue = pickerTime;
	});

	// Convert string value to DateValue for calendar
	const dateValue = $derived.by(() => {
		const datetime = stored(value);
		return datetime ? parseDate(datetime.format('YYYY-MM-DD')) : undefined;
	});

	// The month the calendar shows, set to the field's day each time it opens.
	let calendarMonth = $state<DateValue | undefined>(undefined);

	// Handle date selection from calendar
	function handleDateChange(newValue: DateValue | undefined) {
		if (!newValue) {
			onUpdate(null);
		} else {
			// Combine selected date with current time and convert to UTC
			const dateStr = newValue.toString(); // YYYY-MM-DD
			onUpdate(toStored(dayjs(`${dateStr} ${timeValue}`, 'YYYY-MM-DD HH:mm')));
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

		const parsed = parseDateTimeInput(displayValue, dateFormat, timeFormat);
		if (parsed) {
			onUpdate(toStored(parsed));
			timeValue = parsed.format('HH:mm');
		} else {
			// An unparsable entry is still written, so autosave keeps it and
			// validation names the format it expects.
			onUpdate(displayValue);
		}
	}

	function handleBlur(event: FocusEvent) {
		const parsed = parseDateTimeInput(inputValue, dateFormat, timeFormat);
		if (parsed) inputValue = parsed.format(displayFormat);
		onBlur?.(event);
	}

	// Handle time input changes
	function handleTimeChange(newTime: string) {
		// Blank while the time is still half typed: nothing to combine yet.
		if (!newTime) return;
		timeValue = newTime;

		// If we have a date, combine its local day with the new time
		const datetime = stored(value);
		if (datetime) {
			const dateStr = datetime.format('YYYY-MM-DD');
			onUpdate(toStored(dayjs(`${dateStr} ${newTime}`, 'YYYY-MM-DD HH:mm')));
		}
	}

	// Set to current time
	function setToCurrentTime() {
		const now = dayjs();
		timeValue = now.format('HH:mm');

		// If we have a date, combine its local day with the current time
		const datetime = stored(value);
		if (datetime) {
			const dateStr = datetime.format('YYYY-MM-DD');
			onUpdate(toStored(dayjs(`${dateStr} ${timeValue}`, 'YYYY-MM-DD HH:mm')));
		}
	}
</script>

<div class="space-y-2">
	<div class="flex w-full gap-2">
		<Input
			id={field.name}
			type="text"
			placeholder={dateFormatHint(displayFormat)}
			value={inputValue}
			oninput={handleInputChange}
			onblur={handleBlur}
			onfocus={onFocus}
			class="flex-1 {validationClasses}"
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

				<!-- Time Picker Section -->
				<div class="border-border border-t">
					<div class="flex items-center gap-2 p-3">
						<div class="flex-1">
							<TimeInput
								value={timeValue}
								onChange={handleTimeChange}
								label={i18n.t('Select time')}
								disabled={readonly}
								class="w-full"
							/>
						</div>
						<Button
							variant="outline"
							size="sm"
							onclick={setToCurrentTime}
							disabled={readonly}
							type="button"
						>
							{i18n.t('Set to now')}
						</Button>
					</div>
				</div>
			</Popover.Content>
		</Popover.Root>
	</div>
</div>

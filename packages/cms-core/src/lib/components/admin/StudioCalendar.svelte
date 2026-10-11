<script lang="ts">
	// `@aphexcms/ui`'s Calendar, composed from its own parts so the month
	// buttons and the grid's label take Studio text: bits-ui hardcodes
	// "Previous", "Next" and "Event" in English, and the ui Calendar has no
	// prop to reach them.
	import { Calendar as CalendarPrimitive } from 'bits-ui';
	import * as Calendar from '@aphexcms/ui/shadcn/calendar';
	import * as i18n from '../../i18n/index';
	import { cn } from '@aphexcms/ui/utils';

	// Distributive, so `RootProps` stays a single/multiple union.
	type WithoutChildrenOrChild<T> = T extends unknown ? Omit<T, 'children' | 'child'> : never;

	let {
		value = $bindable(),
		placeholder = $bindable(),
		class: className,
		weekdayFormat = 'short',
		captionLayout = 'label',
		locale = 'en-US',
		yearFormat = 'numeric',
		disableDaysOutsideMonth = false,
		...restProps
	}: WithoutChildrenOrChild<CalendarPrimitive.RootProps> & {
		captionLayout?: 'dropdown' | 'dropdown-months' | 'dropdown-years' | 'label';
		yearFormat?: CalendarPrimitive.YearSelectProps['yearFormat'];
	} = $props();

	const monthFormat = $derived(captionLayout.startsWith('dropdown') ? 'short' : 'long');
</script>

<CalendarPrimitive.Root
	bind:value={value as never}
	bind:placeholder
	{weekdayFormat}
	{disableDaysOutsideMonth}
	calendarLabel={i18n.t('Calendar')}
	class={cn(
		'bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent',
		className
	)}
	{locale}
	{monthFormat}
	{yearFormat}
	{...restProps}
>
	{#snippet children({ months, weekdays })}
		<Calendar.Months>
			<Calendar.Nav>
				<Calendar.PrevButton aria-label={i18n.t('Previous month')} />
				<Calendar.NextButton aria-label={i18n.t('Next month')} />
			</Calendar.Nav>
			{#each months as month, monthIndex (month)}
				<Calendar.Month>
					<Calendar.Header>
						<Calendar.Caption
							{captionLayout}
							months={undefined}
							years={undefined}
							{monthFormat}
							{yearFormat}
							month={month.value}
							bind:placeholder
							{locale}
							{monthIndex}
						/>
					</Calendar.Header>
					<Calendar.Grid>
						<Calendar.GridHead>
							<Calendar.GridRow class="select-none">
								{#each weekdays as weekday (weekday)}
									<Calendar.HeadCell>
										{weekday.slice(0, 2)}
									</Calendar.HeadCell>
								{/each}
							</Calendar.GridRow>
						</Calendar.GridHead>
						<Calendar.GridBody>
							{#each month.weeks as weekDates (weekDates)}
								<Calendar.GridRow class="mt-2 w-full">
									{#each weekDates as date (date)}
										<Calendar.Cell {date} month={month.value}>
											<Calendar.Day />
										</Calendar.Cell>
									{/each}
								</Calendar.GridRow>
							{/each}
						</Calendar.GridBody>
					</Calendar.Grid>
				</Calendar.Month>
			{/each}
		</Calendar.Months>
	{/snippet}
</CalendarPrimitive.Root>

<script lang="ts">
	import { TimeField } from 'bits-ui';
	import * as i18n from '../../../i18n/index';
	import { readTime, writeTime } from '../../../utils/time-of-day';

	interface Props {
		/** The stored `HH:MM`, or blank. */
		value: string;
		/** The accessible name, since the field has no visible label of its own. */
		label: string;
		onChange: (time: string) => void;
		disabled?: boolean;
		class?: string;
	}

	let { value, label, onChange, disabled = false, class: className }: Props = $props();

	// bits-ui's TimeField rather than <input type="time">, which the browser
	// formats in its own language and hour cycle whatever the Studio's locale.
	const time = $derived(readTime(value));

	const PARTS: Record<string, () => string> = {
		hour: () => i18n.t('hour'),
		minute: () => i18n.t('minute'),
		dayPeriod: () => i18n.t('AM/PM')
	};

	function segmentLabel(part: string, fallback: unknown): string | undefined {
		const named = PARTS[part];
		if (named) return `${named()}, `;
		return typeof fallback === 'string' ? fallback : undefined;
	}
</script>

<TimeField.Root
	bind:value={
		() => time,
		(next) => {
			const stored = writeTime(next);
			if (stored !== value) onChange(stored);
		}
	}
	hourCycle={i18n.studioI18n().hourCycle}
	locale={i18n.locale() ?? 'en'}
	{disabled}
>
	<TimeField.Label class="sr-only">{label}</TimeField.Label>
	<TimeField.Input
		class={[
			'border-input bg-background dark:bg-input/30 flex h-9 min-w-0 items-center rounded-md border px-3 py-1 text-base tabular-nums shadow-xs transition-[color,box-shadow] md:text-sm',
			'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
			'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
			className
		]}
	>
		{#snippet children({ segments })}
			{#each segments as { part, value: shown }, index (index)}
				<TimeField.Segment {part}>
					{#snippet child({ props })}
						<span
							{...props}
							aria-label={segmentLabel(part, props['aria-label'])}
							class="focus:bg-accent focus:text-accent-foreground rounded-sm px-px outline-none"
							>{shown}</span
						>
					{/snippet}
				</TimeField.Segment>
			{/each}
		{/snippet}
	</TimeField.Input>
</TimeField.Root>

<script lang="ts">
	import * as i18n from '../../i18n/index';
	import TimeInput from './fields/TimeInput.svelte';
	// Schedule a future publish/unpublish. Layout mirrors Sanity's scheduled-drafts dialog
	// (title · description · "Schedule on" field → calendar+time popover · Cancel/Schedule),
	// in Aphex's shadcn skin. Posts to /documents/:id/schedule; the worker runs it at `runAt`
	// (re-validating then), and `runAt` is floored to the minute so 1:30 means 1:30:00.
	import * as Dialog from '@aphexcms/ui/shadcn/dialog';
	import * as Popover from '@aphexcms/ui/shadcn/popover';
	import { Calendar } from '@aphexcms/ui/shadcn/calendar';
	import { Button } from '@aphexcms/ui/shadcn/button';
	import { Label } from '@aphexcms/ui/shadcn/label';
	import { Calendar as CalendarIcon, Globe } from '@lucide/svelte';
	import { CalendarDate, today, getLocalTimeZone, type DateValue } from '@internationalized/date';
	import { documents } from '../../api/documents';
	import { toast } from 'svelte-sonner';
	import { untrack } from 'svelte';
	import { initialScheduleRunAt } from '../../utils/schedule-time';

	interface Props {
		open: boolean;
		documentId: string;
		/**
		 * The action to schedule. Derived from the editor's active perspective by the caller:
		 * viewing the Draft tab → 'publish' (send this draft live later); viewing the Published
		 * tab → 'unpublish' (take it down later). No in-dialog toggle — the tab is the intent.
		 */
		action: 'publish' | 'unpublish';
		onScheduled?: (job: { jobId: string; type: string; runAt: string; status: string }) => void;
		/** ISO time of the pending schedule, so rescheduling starts from it. */
		initialRunAt?: string;
	}
	let { open = $bindable(), documentId, action, onScheduled, initialRunAt }: Props = $props();

	let dateValue = $state<DateValue | undefined>(undefined);
	let timeStr = $state('09:00'); // "HH:MM", 24h internally
	let pickerOpen = $state(false);
	let submitting = $state(false);

	const minDate = today(getLocalTimeZone());
	// Short local timezone label, e.g. "MST" — shown so the user knows what zone they're setting.
	const tzLabel =
		new Intl.DateTimeFormat(i18n.locale(), { timeZoneName: 'short' })
			.formatToParts(new Date())
			.find((p) => p.type === 'timeZoneName')?.value ?? '';

	const pad = (n: number) => String(n).padStart(2, '0');

	// Reset the date/time each time the dialog opens: the pending schedule's time when there is
	// one, else one hour out, floored to the minute.
	$effect(() => {
		if (open) {
			const d = initialScheduleRunAt(
				untrack(() => initialRunAt),
				new Date()
			);
			dateValue = new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
			timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
		}
	});

	/** Combine the picked calendar date + time into a local Date floored to the minute. */
	function buildRunAt(): Date | null {
		if (!dateValue) return null;
		const [h, m] = timeStr.split(':').map(Number);
		const d = new Date(dateValue.year, dateValue.month - 1, dateValue.day, h ?? 0, m ?? 0, 0, 0);
		return Number.isNaN(d.getTime()) ? null : d;
	}

	const runAtPreview = $derived(buildRunAt());
	const fieldLabel = $derived(
		runAtPreview
			? runAtPreview.toLocaleString(i18n.locale(), {
					month: 'short',
					day: 'numeric',
					year: 'numeric',
					hour: 'numeric',
					minute: '2-digit'
				})
			: i18n.t('Select date and time')
	);

	function setToCurrentTime() {
		const now = new Date();
		dateValue = new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
		timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
	}

	async function submit() {
		const runAt = buildRunAt();
		if (!runAt) {
			toast.error(i18n.t('Pick a date and time'));
			return;
		}
		runAt.setSeconds(0, 0);
		// Reject genuinely past minutes; the current minute is allowed (runs on the next tick).
		const currentMinute = new Date();
		currentMinute.setSeconds(0, 0);
		if (runAt.getTime() < currentMinute.getTime()) {
			toast.error(i18n.t('Pick a time in the future'));
			return;
		}

		submitting = true;
		try {
			const res = await documents.schedule(documentId, { action, runAt: runAt.toISOString() });
			if (res.success) {
				toast.success(
					action === 'publish'
						? i18n.t('Publish scheduled for {time}', { time: runAt.toLocaleString(i18n.locale()) })
						: i18n.t('Unpublish scheduled for {time}', {
								time: runAt.toLocaleString(i18n.locale())
							})
				);
				open = false;
				if (res.data) onScheduled?.(res.data);
			} else {
				toast.error(res.error || res.message || i18n.t('Failed to schedule'));
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : i18n.t('Failed to schedule'));
		} finally {
			submitting = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-md">
		<Dialog.Header>
			<Dialog.Title
				>{action === 'publish'
					? i18n.t('Schedule Publish')
					: i18n.t('Schedule Unpublish')}</Dialog.Title
			>
			<Dialog.Description>
				{action === 'publish'
					? i18n.t('Select when this document should be published.')
					: i18n.t('Select when this document should be unpublished.')}
			</Dialog.Description>
		</Dialog.Header>

		<div class="space-y-4 py-2">
			<div class="space-y-1.5">
				<Label>{i18n.t('Schedule on')}</Label>
				<Popover.Root bind:open={pickerOpen}>
					<Popover.Trigger
						class="border-input bg-background hover:bg-muted/40 focus-visible:ring-ring flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm focus-visible:ring-1 focus-visible:outline-none"
					>
						<span>{fieldLabel}</span>
						<CalendarIcon class="text-muted-foreground h-4 w-4" />
					</Popover.Trigger>
					<Popover.Content class="z-[70] w-[19rem] p-0" align="start">
						<Calendar
							type="single"
							bind:value={dateValue}
							minValue={minDate}
							locale={i18n.locale()}
							class="w-full rounded-b-none [--cell-size:2.4rem]"
						/>
						<div class="border-rule flex flex-wrap items-center gap-x-2 gap-y-1 border-t p-3">
							<TimeInput
								value={timeStr}
								onChange={(time) => (timeStr = time)}
								label={i18n.t('Time')}
								class="w-24"
							/>
							<button
								type="button"
								class="text-muted-foreground hover:text-foreground text-xs underline-offset-2 hover:underline"
								onclick={setToCurrentTime}
							>
								{i18n.t('Set to current time')}
							</button>
							<span class="text-muted-foreground ml-auto flex items-center gap-1 text-xs">
								<Globe class="h-3 w-3" />
								{tzLabel}
							</span>
						</div>
					</Popover.Content>
				</Popover.Root>
			</div>
		</div>

		<Dialog.Footer>
			<Button variant="ghost" size="sm" onclick={() => (open = false)} disabled={submitting}>
				{i18n.t('Cancel')}
			</Button>
			<Button size="sm" onclick={submit} disabled={submitting}>
				{submitting ? i18n.t('Scheduling…') : i18n.t('Schedule')}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

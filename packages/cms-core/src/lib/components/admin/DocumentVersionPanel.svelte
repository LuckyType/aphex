<script lang="ts">
	import * as i18n from '../../i18n/index';
	import { Badge } from '@aphexcms/ui/shadcn/badge';
	import { Button } from '@aphexcms/ui/shadcn/button';
	import { documents } from '../../api/documents';
	import { toast } from 'svelte-sonner';
	import type { SchemaType } from '../../types/schemas';
	import { summarizeVersions } from '../../utils/version-changes';

	interface Props {
		documentId: string;
		/** The Studio's schemas, to name the fields each version changed. */
		schemas?: SchemaType[];
		onClose: () => void;
		onRestored?: () => void;
		onPreviewVersion?: (
			version: {
				versionNumber: number;
				data: Record<string, any>;
				eventType: string;
				createdAt?: string;
			} | null
		) => void;
	}

	// `onRestored` is supplied by the parent (AdminApp) as part of the panel contract;
	// restores are currently driven through DocumentEditor, so it isn't called here.
	// eslint-disable-next-line svelte/no-unused-props
	let { documentId, schemas = [], onClose, onPreviewVersion }: Props = $props();

	let versions = $state<any[]>([]);
	let loading = $state(true);
	let previewVersion = $state<any>(null);
	let filter = $state<'all' | 'publish' | 'draft'>('all');
	// The document's type and whether it is published, for naming what each
	// version changed and which one visitors see.
	let documentType = $state<string | null>(null);
	let published = $state(false);

	const schema = $derived(schemas.find((s) => s.name === documentType) ?? null);
	const summaries = $derived(
		summarizeVersions(versions, {
			fields: schema ? schema.fields.map((f) => f.name) : null,
			published
		})
	);

	function fieldTitle(name: string): string {
		return schema?.fields.find((f) => f.name === name)?.title ?? name;
	}

	// "Title, Blocks, Address" and how many more, so a long list stays one line.
	function changedText(names: string[]): string {
		if (names.length === 0) return i18n.t('No changes');
		const shown = names.slice(0, 3).map(fieldTitle).join(', ');
		const fields = names.length > 3 ? `${shown} +${names.length - 3}` : shown;
		return i18n.t('Changed: {fields}', { fields });
	}

	const filteredVersions = $derived(
		filter === 'all' ? versions : versions.filter((v) => v.eventType === filter)
	);

	$effect(() => {
		loadVersions();
	});

	// Exposed so the parent (AdminApp) can refresh the list after autosave /
	// publish events without remounting the panel.
	export function refresh() {
		return loadVersions();
	}

	async function loadVersions() {
		loading = true;
		try {
			const [res, doc] = await Promise.all([
				documents.listVersions(documentId, { limit: 100 }),
				documents.getById(documentId).catch(() => null)
			]);
			if (res.success && res.data) {
				versions = res.data;
			}
			if (doc?.success && doc.data) {
				const meta = doc.data._meta;
				documentType = (meta?.type as string | undefined) ?? null;
				published = !!meta?.publishedHash && meta.status !== 'unpublished';
			}
		} catch {
			toast.error(i18n.t('Failed to load versions'));
		} finally {
			loading = false;
		}
	}

	async function previewVersionData(version: any) {
		try {
			const res = await documents.getVersion(documentId, version.versionNumber);
			if (res.success && res.data) {
				previewVersion = { ...version, data: res.data.data ?? {} };
				onPreviewVersion?.({
					versionNumber: version.versionNumber,
					data: res.data.data ?? {},
					eventType: version.eventType,
					createdAt: version.createdAt ?? undefined
				});
			}
		} catch {
			toast.error(i18n.t('Failed to load version'));
		}
	}
</script>

<div class="flex h-full flex-col">
	<!-- Header -->
	<div class="border-border bg-background flex h-14 items-center justify-between border-b px-3">
		<h3 class="text-sm font-medium">{i18n.t('History')}</h3>
		<Button class="hover:bg-muted rounded p-1 transition-colors" variant="ghost" onclick={onClose}>
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		</Button>
	</div>

	<!-- Filter tabs -->
	<div class="border-border flex border-b">
		{#each [{ value: 'all', label: i18n.t('All') }, { value: 'publish', label: i18n.t('Published') }, { value: 'draft', label: i18n.t('Drafts') }] as tab}
			<Button
				variant="ghost"
				class="flex-1 cursor-pointer rounded-none px-2 py-2 text-xs font-medium transition-colors {filter ===
				tab.value
					? 'border-primary text-foreground border-b-2'
					: 'text-muted-foreground hover:text-foreground'}"
				aria-pressed={filter === tab.value}
				onclick={() => {
					filter = tab.value as any;
				}}
			>
				{tab.label}
			</Button>
		{/each}
	</div>

	<!-- Version List -->
	<div class="flex-1 overflow-auto">
		{#if loading}
			<div class="p-4 text-center">
				<span class="text-muted-foreground text-xs">{i18n.t('Loading...')}</span>
			</div>
		{:else if filteredVersions.length === 0}
			<div class="p-4 text-center">
				<span class="text-muted-foreground text-xs"
					>{filter === 'all'
						? i18n.t('No versions')
						: filter === 'publish'
							? i18n.t('No publish versions')
							: i18n.t('No draft versions')}</span
				>
			</div>
		{:else}
			{#each filteredVersions as version, i}
				{@const summary = summaries.get(version.versionNumber)}
				<div
					role="button"
					tabindex="0"
					aria-pressed={previewVersion?.versionNumber === version.versionNumber}
					data-current={summary?.current ? '' : undefined}
					data-version-id={i}
					class="hover:bg-muted w-full cursor-pointer border-b px-3 py-2.5 text-left transition-colors {previewVersion?.versionNumber ===
					version.versionNumber
						? 'bg-muted border-l-primary border-l-2'
						: ''}"
					onclick={() => previewVersionData(version)}
					onkeydown={(event) => {
						if (event.key !== 'Enter' && event.key !== ' ') return;
						event.preventDefault();
						previewVersionData(version);
					}}
				>
					<div class="flex items-center justify-between">
						<span class="text-muted-foreground text-[11px]">
							{new Date(version.createdAt).toLocaleString(i18n.locale(), {
								month: 'short',
								day: 'numeric',
								hour: 'numeric',
								minute: '2-digit',
								hour12: i18n.hour12() ?? true
							})}
						</span>
						<span class="flex items-center gap-1">
							{#if summary?.current}
								<Badge variant="outline" class="border-green-600/40 px-1.5 py-0 text-[9px]">
									{i18n.t('Currently published')}
								</Badge>
							{/if}
							<Badge
								variant={version.eventType === 'publish' ? 'default' : 'secondary'}
								class="px-1.5 py-0 text-[9px]"
							>
								{i18n.t(version.eventType, undefined, 'version event')}
							</Badge>
						</span>
					</div>
					{#if summary?.changed}
						<p class="text-foreground/80 mt-0.5 truncate text-[11px]" data-version-changes>
							{changedText(summary.changed)}
						</p>
					{/if}
					{#if version.createdByName}
						<p class="text-muted-foreground mt-0.5 truncate text-[10px]">
							{version.createdByName}
						</p>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</div>

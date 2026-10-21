<!--
  The editor's breadcrumbs: the document list, the document and every panel
  opened inside it, each one a way back to that level, with one back arrow
  that goes up a single level. When they do not fit, the crumbs in the
  middle fold into a menu, nearest the start first, so the first two and
  the item in view stay readable.
-->
<script lang="ts">
	import { flushSync } from 'svelte';
	import * as DropdownMenu from '@aphexcms/ui/shadcn/dropdown-menu';
	import { ArrowLeft, Ellipsis } from '@lucide/svelte';
	import * as i18n from '../../i18n/index';
	import { type EditorCrumb, foldable, middleCut } from '../../editor-trail.svelte';

	let {
		crumbs,
		onUp,
		upLabel = i18n.t('Back'),
		class: className = ''
	}: {
		crumbs: EditorCrumb[];
		/** The back arrow's action; without one there is no arrow. */
		onUp?: (() => void) | null;
		upLabel?: string;
		class?: string;
	} = $props();

	let list = $state<HTMLElement | null>(null);
	let hidden = $state(0);
	const shown = $derived(middleCut(crumbs, hidden));
	// Crumbs fold away before any is cut short; only once none is left to
	// fold does the item in view give up its width.
	const leafShrinks = $derived(hidden >= foldable(crumbs.length));

	// Folds one more crumb away until the row fits, starting from none.
	function fit() {
		if (!list) return;
		const most = foldable(crumbs.length);
		for (let next = 0; next <= most; next++) {
			hidden = next;
			flushSync();
			if (list.scrollWidth <= list.clientWidth) return;
		}
	}

	$effect(() => {
		if (!list) return;
		const observer = new ResizeObserver(() => fit());
		observer.observe(list);
		return () => observer.disconnect();
	});

	$effect(() => {
		// Measured again whenever the way changes.
		void crumbs.map((crumb) => crumb.label).join('/');
		const frame = requestAnimationFrame(() => fit());
		return () => cancelAnimationFrame(frame);
	});

	const crumbClass =
		'hover:text-foreground hover:bg-muted -mx-1 cursor-pointer truncate rounded px-1 transition-colors';
</script>

<div class={['flex min-w-0 items-center gap-1.5', className]} data-editor-breadcrumbs>
	{#if onUp}
		<button
			type="button"
			onclick={onUp}
			class="hover:text-foreground hover:bg-muted -ml-1 flex shrink-0 cursor-pointer items-center rounded p-1 transition-colors"
			title={upLabel}
			aria-label={upLabel}
			data-editor-up
		>
			<ArrowLeft class="h-4 w-4" />
		</button>
	{/if}
	<nav aria-label={i18n.t('Breadcrumb')} class="min-w-0 flex-1">
		<ol
			bind:this={list}
			class="flex min-w-0 items-center gap-1.5 overflow-hidden whitespace-nowrap"
		>
			{#each shown as item, at (item.kind === 'crumb' ? `c${item.index}` : 'more')}
				{#if at > 0}
					<li class="shrink-0 opacity-60" aria-hidden="true">/</li>
				{/if}
				{#if item.kind === 'more'}
					<li class="shrink-0">
						<DropdownMenu.Root>
							<DropdownMenu.Trigger
								class="hover:text-foreground hover:bg-muted flex cursor-pointer items-center rounded px-1 transition-colors"
								aria-label={i18n.t('Show {count} more levels', { count: item.crumbs.length })}
							>
								<Ellipsis class="h-4 w-4" />
							</DropdownMenu.Trigger>
							<DropdownMenu.Content align="start">
								{#each item.crumbs as crumb, i (i)}
									<DropdownMenu.Item onclick={() => crumb.select?.()} title={crumb.title}>
										{crumb.label}
									</DropdownMenu.Item>
								{/each}
							</DropdownMenu.Content>
						</DropdownMenu.Root>
					</li>
				{:else if item.index === crumbs.length - 1}
					<!-- The item in view: its name, nothing to go to. -->
					<li
						class={['text-foreground', leafShrinks ? 'min-w-0 truncate' : 'shrink-0']}
						aria-current="page"
						title={item.crumb.title}
					>
						{item.crumb.label}
					</li>
				{:else}
					<li class="flex max-w-[12rem] shrink-0">
						{#if item.crumb.select}
							<button
								type="button"
								class={crumbClass}
								title={item.crumb.title ?? item.crumb.label}
								onclick={() => item.crumb.select?.()}
							>
								{item.crumb.label}
							</button>
						{:else}
							<span class="truncate" title={item.crumb.title}>{item.crumb.label}</span>
						{/if}
					</li>
				{/if}
			{/each}
		</ol>
	</nav>
</div>

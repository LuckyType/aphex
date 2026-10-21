<script lang="ts" module>
	import type { Asset } from '../../../types/asset';

	// One request per asset however many rows (and re-renders) show it. A plain
	// cache, never read reactively.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const assetRequests = new Map<string, Promise<Asset | null>>();
</script>

<script lang="ts">
	// The face of an array row: a thumbnail (or the type's icon) beside the
	// row's title and subtitle. `media` is what the schema's `preview` names,
	// usually an image or file value; a row without a title of its own is
	// named by that asset's alt text, title or file name, so a list of photos
	// reads as the photos rather than "Image", "Image", "Image".
	import type { Component } from 'svelte';
	import { FileText } from '@lucide/svelte';
	import { assets } from '../../../api/assets';
	import AssetImage from '../AssetImage.svelte';

	interface Props {
		/** The title the item's own data gives it, or null. */
		title: string | null;
		/** The title to show when neither the item nor its asset names it. */
		fallbackTitle: string;
		subtitle?: string | null;
		media?: unknown;
		icon?: Component | null;
	}

	let { title, fallbackTitle, subtitle = null, media, icon = null }: Props = $props();

	function assetRef(value: unknown): string | null {
		const ref = (value as { asset?: { _ref?: unknown } } | null | undefined)?.asset?._ref;
		return typeof ref === 'string' && ref ? ref : null;
	}

	function loadAsset(id: string): Promise<Asset | null> {
		let request = assetRequests.get(id);
		if (!request) {
			request = assets
				.getById(id)
				.then((result) => (result.success && result.data ? result.data : null))
				.catch(() => null);
			assetRequests.set(id, request);
			// A failed lookup may succeed later (a slow network); keep only answers.
			void request.then((asset) => {
				if (!asset) assetRequests.delete(id);
			});
		}
		return request;
	}

	const ref = $derived(assetRef(media));
	const address = $derived(
		typeof media === 'string' && /^(https?:)?\/\//.test(media) ? media : null
	);

	let asset = $state<Asset | null>(null);
	$effect(() => {
		const id = ref;
		asset = null;
		if (!id) return;
		let current = true;
		void loadAsset(id).then((found) => {
			if (current) asset = found;
		});
		return () => {
			current = false;
		};
	});

	const altText = $derived((media as { alt?: unknown } | null | undefined)?.alt);
	const shownTitle = $derived(
		title ??
			(typeof altText === 'string' && altText.trim() ? altText.trim() : null) ??
			asset?.alt ??
			asset?.title ??
			asset?.originalFilename ??
			fallbackTitle
	);
	const isImage = $derived(!!asset?.mimeType?.startsWith('image/') && !!asset.url);
	const Icon = $derived(icon ?? FileText);
</script>

<span class="flex min-w-0 flex-1 items-center gap-2">
	{#if isImage && asset}
		<AssetImage
			src={asset.url}
			alt=""
			mimeType={asset.mimeType}
			class="bg-muted h-8 w-8 shrink-0 rounded object-cover"
			loading="lazy"
		/>
	{:else if address}
		<img
			src={address}
			alt=""
			class="bg-muted h-8 w-8 shrink-0 rounded object-cover"
			loading="lazy"
		/>
	{:else}
		<span class="text-muted-foreground flex h-5 w-5 shrink-0 items-center justify-center">
			<Icon class="h-4 w-4" aria-hidden="true" />
		</span>
	{/if}
	<span class="flex min-w-0 flex-1 flex-col">
		<span class="truncate">{shownTitle}</span>
		{#if subtitle}
			<span class="text-muted-foreground truncate text-xs">{subtitle}</span>
		{/if}
	</span>
</span>

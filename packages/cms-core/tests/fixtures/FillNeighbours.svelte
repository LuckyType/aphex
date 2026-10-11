<!-- A widget that fills two neighbours from one click, for field-siblings.svelte.spec.ts. -->
<script lang="ts">
	let { onUpdateSiblings }: { onUpdateSiblings?: (patch: Record<string, unknown>) => void } =
		$props();
</script>

<button type="button" onclick={() => onUpdateSiblings?.({ street: 'Hauptstr. 1', city: 'Berlin' })}>
	Fill
</button>

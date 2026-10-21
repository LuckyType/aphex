<!-- A widget that opens another document, for field-hooks.svelte.spec.ts. -->
<script lang="ts">
	let { onOpenDocument }: { onOpenDocument?: (documentId: string, documentType: string) => void } =
		$props();
</script>

<button type="button" onclick={() => onOpenDocument?.('hours-1', 'openingHours')}>Open</button>

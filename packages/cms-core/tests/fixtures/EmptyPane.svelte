<!-- An `emptyPane` for studio-list-header-empty-pane.svelte.spec.ts. -->
<script lang="ts">
	import type { StudioEmptyPaneProps } from '../../src/lib/studio-extensions';

	let { types, onselect }: StudioEmptyPaneProps = $props();
</script>

<ul aria-label="Empty pane">
	{#each types as type (type.name)}
		<li><button type="button" onclick={() => onselect(type.name)}>Open {type.title}</button></li>
	{/each}
</ul>

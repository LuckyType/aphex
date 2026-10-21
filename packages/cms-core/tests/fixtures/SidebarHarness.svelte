<!-- The admin layout's Sidebar with an empty page, for sidebar-area-tabs.svelte.spec.ts. -->
<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import Sidebar from '../../src/lib/components/layout/Sidebar.svelte';

	let props: Omit<ComponentProps<typeof Sidebar>, 'children'> = $props();
</script>

<Sidebar {...props}><p>Page</p></Sidebar>

<!-- AdminApp inside the sidebar provider its layout gives it in an app. -->
<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import * as Sidebar from '@aphexcms/ui/shadcn/sidebar';
	import AdminApp from '../../src/lib/components/AdminApp.svelte';

	let props: ComponentProps<typeof AdminApp> = $props();
</script>

<Sidebar.Provider>
	<AdminApp {...props} />
</Sidebar.Provider>

<script lang="ts">
	import { DragDropProvider } from '@dnd-kit/svelte';
	import { DragDropManager } from '@dnd-kit/dom';
	import { onDestroy, type ComponentProps, type Snippet } from 'svelte';
	import { studioDragPlugins } from './drag-a11y';

	let {
		onDragEnd,
		children
	}: { onDragEnd: ComponentProps<typeof DragDropProvider>['onDragEnd']; children?: Snippet } =
		$props();

	// dnd-kit's Accessibility plugin reads its texts once, as the manager is
	// built (@dnd-kit/dom 0.3.0): the provider's `plugins` prop reaches an
	// instance that already has the English ones and only updates its options,
	// which nothing reads again. So the manager is built here with the plugins,
	// and, as the provider destroys only a manager it made itself, destroyed here.
	const manager = new DragDropManager({ plugins: studioDragPlugins });
	onDestroy(() => manager.destroy());
</script>

<DragDropProvider {manager} {onDragEnd}>
	{@render children?.()}
</DragDropProvider>

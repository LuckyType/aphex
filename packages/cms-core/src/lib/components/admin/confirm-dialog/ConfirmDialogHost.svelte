<script lang="ts">
	import * as AlertDialog from '@aphexcms/ui/shadcn/alert-dialog';
	import { buttonVariants } from '@aphexcms/ui/shadcn/button';
	import { onDestroy } from 'svelte';
	import {
		claimConfirmDialogHost,
		confirmDialogState,
		isActiveConfirmDialogHost,
		releaseConfirmDialogHost,
		resolveConfirmDialog
	} from './confirm-dialog.svelte';

	// Only one host renders, so a second one mounted by an app is a no-op. Claimed
	// in the browser only: module state on the server is shared across requests.
	const hostId = typeof window !== 'undefined' ? claimConfirmDialogHost() : undefined;
	onDestroy(() => {
		if (hostId) releaseConfirmDialogHost(hostId);
	});
	const active = $derived(hostId !== undefined && isActiveConfirmDialogHost(hostId));

	function handleOpenChange(open: boolean) {
		if (!open && confirmDialogState.open) {
			resolveConfirmDialog(false);
		}
	}
</script>

{#if active}
	<AlertDialog.Root bind:open={confirmDialogState.open} onOpenChange={handleOpenChange}>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title class="break-words">{confirmDialogState.title}</AlertDialog.Title>
				{#if confirmDialogState.description}
					<AlertDialog.Description class="break-words">
						{confirmDialogState.description}
					</AlertDialog.Description>
				{/if}
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel onclick={() => resolveConfirmDialog(false)}>
					{confirmDialogState.cancelText}
				</AlertDialog.Cancel>
				<AlertDialog.Action
					class={confirmDialogState.variant === 'destructive'
						? buttonVariants({ variant: 'destructive' })
						: undefined}
					onclick={() => resolveConfirmDialog(true)}
				>
					{confirmDialogState.confirmText}
				</AlertDialog.Action>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
{/if}

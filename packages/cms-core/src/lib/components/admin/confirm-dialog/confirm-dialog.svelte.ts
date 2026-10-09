import * as i18n from '../../../i18n/index';
export interface ConfirmDialogOptions {
	title: string;
	description?: string;
	confirmText?: string;
	cancelText?: string;
	variant?: 'default' | 'destructive';
}

interface ConfirmDialogState extends ConfirmDialogOptions {
	open: boolean;
	resolve: ((value: boolean) => void) | null;
}

export const confirmDialogState = $state<ConfirmDialogState>({
	open: false,
	title: '',
	description: undefined,
	confirmText: i18n.t('Confirm'),
	cancelText: i18n.t('Cancel'),
	variant: 'default',
	resolve: null
});

export function confirmDialog(options: ConfirmDialogOptions): Promise<boolean> {
	return new Promise((resolve) => {
		if (confirmDialogState.resolve) {
			confirmDialogState.resolve(false);
		}
		confirmDialogState.title = options.title;
		confirmDialogState.description = options.description;
		confirmDialogState.confirmText = options.confirmText ?? i18n.t('Confirm');
		confirmDialogState.cancelText = options.cancelText ?? i18n.t('Cancel');
		confirmDialogState.variant = options.variant ?? 'default';
		confirmDialogState.resolve = resolve;
		confirmDialogState.open = true;
	});
}

export function resolveConfirmDialog(value: boolean) {
	const r = confirmDialogState.resolve;
	confirmDialogState.resolve = null;
	confirmDialogState.open = false;
	r?.(value);
}

/**
 * Mounted hosts, oldest first. All of them would render the same shared state,
 * so an app that mounts its own `ConfirmDialogHost` beside the admin's would
 * show every dialog twice. Only the oldest live host renders; when it unmounts,
 * the next one takes over.
 */
const confirmDialogHosts = $state<{ ids: symbol[] }>({ ids: [] });

/** Register a mounted host. Pair with `releaseConfirmDialogHost` on destroy. */
export function claimConfirmDialogHost(): symbol {
	const id = Symbol('confirm-dialog-host');
	confirmDialogHosts.ids.push(id);
	return id;
}

export function releaseConfirmDialogHost(id: symbol) {
	const index = confirmDialogHosts.ids.indexOf(id);
	if (index !== -1) confirmDialogHosts.ids.splice(index, 1);
}

/** Whether this host is the one that renders the dialog. */
export function isActiveConfirmDialogHost(id: symbol): boolean {
	return confirmDialogHosts.ids[0] === id;
}

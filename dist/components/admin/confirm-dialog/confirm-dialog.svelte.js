import * as i18n from '../../../i18n/index.js';
export const confirmDialogState = $state({
    open: false,
    title: '',
    description: undefined,
    confirmText: i18n.t('Confirm'),
    cancelText: i18n.t('Cancel'),
    variant: 'default',
    resolve: null
});
export function confirmDialog(options) {
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
export function resolveConfirmDialog(value) {
    const r = confirmDialogState.resolve;
    confirmDialogState.resolve = null;
    confirmDialogState.open = false;
    r?.(value);
}

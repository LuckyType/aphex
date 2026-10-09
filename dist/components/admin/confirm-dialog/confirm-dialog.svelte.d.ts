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
export declare const confirmDialogState: ConfirmDialogState;
export declare function confirmDialog(options: ConfirmDialogOptions): Promise<boolean>;
export declare function resolveConfirmDialog(value: boolean): void;
export {};
//# sourceMappingURL=confirm-dialog.svelte.d.ts.map
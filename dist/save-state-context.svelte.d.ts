export interface SaveState {
    readonly saving: boolean;
    readonly hasUnsavedChanges: boolean;
    readonly savedAgoText: string | null;
}
export declare function setSaveStateContext(state: SaveState): void;
export declare function getSaveStateContext(): SaveState | null;
//# sourceMappingURL=save-state-context.svelte.d.ts.map
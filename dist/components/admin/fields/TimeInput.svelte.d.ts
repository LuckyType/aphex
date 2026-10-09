interface Props {
    /** The stored `HH:MM`, or blank. */
    value: string;
    /** The accessible name, since the field has no visible label of its own. */
    label: string;
    onChange: (time: string) => void;
    disabled?: boolean;
    class?: string;
}
declare const TimeInput: import("svelte").Component<Props, {}, "">;
type TimeInput = ReturnType<typeof TimeInput>;
export default TimeInput;
//# sourceMappingURL=TimeInput.svelte.d.ts.map
import { type ActionReturn } from 'svelte/action';
type ElementEvent<K extends keyof HTMLElementEventMap = keyof HTMLElementEventMap> = {
    [P in K]: {
        name: P;
        handler: (event: HTMLElementEventMap[P]) => void;
        options?: boolean | AddEventListenerOptions;
    };
}[K];
interface ElementEventsParams {
    events: ElementEvent[] | null;
    enabled?: boolean;
}
export default function elementEvents(node: HTMLElement, { events, enabled }: ElementEventsParams): ActionReturn;
export {};
//# sourceMappingURL=element-events.d.ts.map
import type { Component } from 'svelte';
/** A suggestion can be a bare string, or `{ text, icon }` for a leading icon — the plain
 * string form stays the common case so existing callers don't need to change anything. */
type Suggestion = string | {
    text: string;
    icon?: Component;
};
type $$ComponentProps = {
    embedded?: boolean;
    title?: string;
    subtitle?: string;
    suggestions?: Suggestion[];
};
declare const AgentChat: Component<$$ComponentProps, {}, "">;
type AgentChat = ReturnType<typeof AgentChat>;
export default AgentChat;
//# sourceMappingURL=AgentChat.svelte.d.ts.map
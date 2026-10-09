// types/document-workspace.ts
//
// A live handle onto a document currently open (and possibly unsaved) in an editor tab —
// not an AI-specific type. The agent's `content_patch_fields`/`content_save_draft` tools
// (ai/content-workspace-tools.ts) are its first consumer, not its only intended one: a
// future multiplayer feature would need the exact same primitives (apply an incoming
// operation to the live draft, batch/suppress autosave while a burst of operations lands,
// find which document sessions are open in this tab). `apply()`'s operation type and
// `beginBatch()`'s source are both open unions for that reason — a new consumer is a new
// union member, not a redesign of this interface.
//
// Client-safe: no server imports. Implemented by `DocumentEditor.svelte`, registered into
// `document-workspace-registry.svelte.ts` while mounted.
export {};

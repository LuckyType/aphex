// types/agent-stream.ts
//
// Browser-facing stream contract for an agent turn — what an SSE/NDJSON chat
// endpoint actually sends over the wire. Deliberately close to `AIProviderAdapter`'s `AIStreamEvent`
// (ai/interfaces/ai-provider.ts) since most events pass through unchanged — this type
// adds the one thing the provider boundary doesn't have: the *result* of a tool call
// the runtime executed, which the browser needs to render (and which the model needs
// fed back as a `tool` message for the next round trip).
//
// Client-safe: no DB handles, no provider SDKs, just the wire shape.
export {};

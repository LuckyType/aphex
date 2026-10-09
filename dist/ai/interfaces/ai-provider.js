// ai/interfaces/ai-provider.ts
//
// Ports & adapters for the in-admin agent's model backend — same shape as
// EmailAdapter (see ../../email/interfaces/email.ts): cms-core owns the
// provider-neutral contract only; concrete provider clients (credentials,
// wire format, streaming parse) live in separate packages the app wires in
// via `createCMSConfig({ aiProvider: ... })`. Exactly one active instance-wide,
// same as database/storage/email — not a plugin, since a CMS install picks
// one model backend, not a composable set of them.
//
// Two adapters cover four providers: OpenAI, OpenRouter, and Ollama all speak
// the same OpenAI-compatible chat-completions + function-calling wire format
// (they differ only in base URL and auth), so one adapter handles all three;
// Anthropic's Messages API has a genuinely different shape (`tool_use` content
// blocks vs OpenAI's `tool_calls`) and gets its own.
export {};

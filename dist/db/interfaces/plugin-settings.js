// Plugin-settings adapter interface — the generic per-(org, plugin) config store.
//
// This is the storage primitive behind the plugin settings & secrets feature
// (references/plugin-settings-and-secrets-scope.md). It is deliberately generic:
// ONE table serves every plugin, keyed by (organizationId, pluginId), one row per
// pair (a config singleton). Values are an opaque JSON object — the store neither
// knows nor cares which values are content vs config vs encrypted secrets. Core
// handles encryption/decryption of secret fields above this layer; the adapter only
// persists the resulting strings.
//
// NOT part of the content model: no drafts, versions, references, or RLS-as-content.
// Org isolation is by the `organizationId` key (and RLS on the pglite path).
export {};

// Narrow client entrypoint: admin chrome + context primitives, WITHOUT the
// document editor and field widgets.
//
// The main `@aphexcms/cms-core/client` barrel also re-exports DocumentEditor,
// SchemaField, AdminApp and every *Field component. Those pull the whole field
// registry (+@dnd-kit, +lucide) into one chunk (~597 kB min / 155 kB gzip). A
// page that only wants Sidebar, a confirm dialog or the permissions context is
// downloaded that entire chunk purely because it shares the barrel — Rollup's
// download unit is the chunk, not the tree-shaken symbol.
//
// Everything re-exported here is verified free of field-component imports, so
// the admin layout and non-editor admin pages (settings, members, roles…) can
// import from `/client/ui` and stay off the editor chunk. The editor route that
// mounts AdminApp/DocumentEditor keeps importing from the full `/client`.
// Core + sidebar types
export * from '../types/index.js';
// Field validation (client-side Rule + helpers) — plain JS
export * from '../field-validation/rule.js';
export * from '../field-validation/utils.js';
// Content hashing (change detection)
export { createContentHash, hasUnpublishedChanges } from '../utils/content-hash.js';
// Schema context
export { setSchemaContext, getSchemaContext } from '../schema-context.svelte.js';
// Admin extension slots (plugin seam)
export { AdminSlots, setAdminSlots, useAdminSlots } from '../admin/slots.svelte.js';
// Field-input widget registry (plugins register components for a field's `input`)
export { setFieldComponents, useFieldComponents } from '../admin/field-components.svelte.js';
// Admin URL navigation
export { createAdminNav, setAdminNav, useAdminNav } from '../admin/nav.svelte.js';
// Permissions context (capability-based UI gating)
export { setPermissionsContext, usePermissions } from '../permissions-context.svelte.js';
// Schema utilities
export * from '../schema-utils/index.js';
// Inline editor previews for custom rich-text block types (registration only —
// the previews themselves are app-owned and lazy).
export { setBlockPreviews, useBlockPreviews } from '../admin/block-previews.svelte.js';
// Admin chrome
export { default as Sidebar } from '../components/layout/Sidebar.svelte';
export { default as AgentChat } from '../components/admin/AgentChat.svelte';
export { default as PermissionsDebug } from '../components/admin/PermissionsDebug.svelte';
// Plugin settings panel — renders its own inputs, does not pull the field registry.
export { default as PluginSettingsPanel } from '../components/admin/PluginSettingsPanel.svelte';
// Job/event history (read-only observability). Light — plain fetch + tables, no field editor.
export { default as ActivityView } from '../components/admin/ActivityView.svelte';
// Browser-safe utilities + API client
export * from '../utils/index.js';
export * from '../api/index.js';
// Toast notifications
export { toast } from 'svelte-sonner';
// Confirm dialog (imperative API + host)
export { confirmDialog } from '../components/admin/confirm-dialog/confirm-dialog.svelte.js';
export { default as ConfirmDialogHost } from '../components/admin/confirm-dialog/ConfirmDialogHost.svelte';
// Live-preview stega helper (small)
export { stegaClean } from '../preview/stega.js';

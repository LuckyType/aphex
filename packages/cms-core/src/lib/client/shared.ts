// The client exports both entrypoints carry: `./ui` (admin chrome, no field
// editor) and `./index` (everything). Only re-exports, nothing heavier than
// what `./ui` may pull in.
// Core + sidebar types
export * from '../types/index';
export type { SidebarUser, SidebarNavItem, SidebarBranding, SidebarData } from '../types/sidebar';

// Field validation (client-side Rule + helpers) — plain JS
export * from '../field-validation/rule';
export * from '../field-validation/utils';

// Content hashing (change detection)
export { createContentHash, hasUnpublishedChanges } from '../utils/content-hash';

// Schema context
export { setSchemaContext, getSchemaContext } from '../schema-context.svelte';

// Admin extension slots (plugin seam)
export {
	AdminSlots,
	setAdminSlots,
	useAdminSlots,
	type AdminSlotName,
	type AdminSlotEntry
} from '../admin/slots.svelte';
export type { AdminArea } from '../admin/types';

// Field-input widget registry (plugins register components for a field's `input`)
export {
	setFieldComponents,
	useFieldComponents,
	type FieldComponentLookup
} from '../admin/field-components.svelte';
// A custom input reports when its field counts as touched (`fieldErrors: 'touched'`).
export { useFieldTouch } from '../field-touch-context.svelte';
// A custom input that edits an item in a panel names it in the editor's breadcrumbs.
export {
	EditorTrail,
	setEditorTrail,
	useEditorTrail,
	getEditorTrail,
	type EditorCrumb,
	type EditorTrailEntry,
	type EditorTrailHandle
} from '../editor-trail.svelte';

// Admin URL navigation
export {
	createAdminNav,
	setAdminNav,
	useAdminNav,
	type AdminNav,
	type AdminParam,
	type ParamPatch
} from '../admin/nav.svelte';

// Permissions context (capability-based UI gating)
export {
	setPermissionsContext,
	usePermissions,
	type PermissionsContext
} from '../permissions-context.svelte';

// Schema utilities
export * from '../schema-utils/index';

// Inline editor previews for custom rich-text block types (registration only —
// the previews themselves are app-owned and lazy).
export {
	setBlockPreviews,
	useBlockPreviews,
	type BlockPreviewProps,
	type BlockPreviewLookup
} from '../admin/block-previews.svelte';

// Admin chrome
export { default as Sidebar } from '../components/layout/Sidebar.svelte';
export { default as AgentChat } from '../components/admin/AgentChat.svelte';
export { default as PermissionsDebug } from '../components/admin/PermissionsDebug.svelte';
// Plugin settings panel — renders its own inputs, does not pull the field registry.
export { default as PluginSettingsPanel } from '../components/admin/PluginSettingsPanel.svelte';

// Browser-safe utilities + API client
export * from '../utils/index';
export * from '../api/index';
export type { ApiResponse } from '../api/index';

// Toast notifications
export { toast } from 'svelte-sonner';

// Confirm dialog (imperative API + host)
export {
	confirmDialog,
	type ConfirmDialogOptions
} from '../components/admin/confirm-dialog/confirm-dialog.svelte';
export { default as ConfirmDialogHost } from '../components/admin/confirm-dialog/ConfirmDialogHost.svelte';

// Live-preview stega helper (small)
export { stegaClean } from '../preview/stega.js';

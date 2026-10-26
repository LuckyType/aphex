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

export * from './shared';

// Job/event history (read-only observability). Light — plain fetch + tables, no field editor.
export { default as ActivityView } from '../components/admin/ActivityView.svelte';
// Organization members page (invite / copy link / roles / remove). Loads from `/api/organizations/team`.
export { default as MembersSettings } from '../components/admin/MembersSettings.svelte';

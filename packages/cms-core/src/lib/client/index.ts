// Aphex CMS Core - Client-side exports
// These are safe to import in the browser (no Node.js dependencies)

export * from './shared';

// Components (UI components for the admin interface)
export { default as DocumentEditor } from '../components/admin/DocumentEditor.svelte';
export { default as SchemaField } from '../components/admin/SchemaField.svelte';
export { default as EditorBreadcrumbs } from '../components/admin/EditorBreadcrumbs.svelte';
export { default as AdminApp } from '../components/AdminApp.svelte';

// Field components
export { default as StringField } from '../components/admin/fields/StringField.svelte';
export { default as TextareaField } from '../components/admin/fields/TextareaField.svelte';
export { default as NumberField } from '../components/admin/fields/NumberField.svelte';
export { default as BooleanField } from '../components/admin/fields/BooleanField.svelte';
export { default as ImageField } from '../components/admin/fields/ImageField.svelte';
export { default as FileField } from '../components/admin/fields/FileField.svelte';
export { default as SlugField } from '../components/admin/fields/SlugField.svelte';
export { default as ArrayField } from '../components/admin/fields/ArrayField.svelte';
export { default as ReferenceField } from '../components/admin/fields/ReferenceField.svelte';

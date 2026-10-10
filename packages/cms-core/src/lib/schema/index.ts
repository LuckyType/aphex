// Aphex CMS Core - Schema-safe exports
// These can be safely imported in schema files without pulling in Svelte components

// Core types (shared between client and server)
export * from '../types/index';

// Field validation (for schema definitions)
export * from '../field-validation/rule';
export * from '../field-validation/utils';

// Initial value helpers (for schema initialValue functions)
export * from '../utils/initial-value-helpers';

// Schema utilities
export * from '../schema-utils/index';

// A label a schema writes at render time (a `preview.prepare` fallback), in
// the Studio's language. Plain TS, no Svelte.
export { label as studioLabel } from '../i18n/index';

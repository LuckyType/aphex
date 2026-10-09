/**
 * SvelteKit ambient type augmentations emitted by Aphex CMS.
 *
 * Side-effect import only — activates the global `App.PageData` shape so
 * `$page.data.rbac` is typed inside any project that uses cms-core, without
 * requiring each app to hand-maintain the `App.PageData` interface.
 *
 * Import once from `src/app.d.ts`:
 *
 * ```ts
 * import '@aphexcms/cms-core/app-augment';
 * ```
 *
 * The module has no runtime — it's purely a type-augmentation carrier. Kept
 * as a `.ts` file (not `.d.ts`) so Vite/SvelteKit can resolve the import path
 * via the package's `./*` export map.
 */
export {};

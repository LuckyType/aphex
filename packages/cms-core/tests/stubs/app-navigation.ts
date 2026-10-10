// SvelteKit's `$app/navigation` for component tests, which run outside an
// app (vite.config.ts aliases it here under Vitest only).
export const goto = async () => {};
export const invalidateAll = async () => {};
export const beforeNavigate = () => {};
export const afterNavigate = () => {};

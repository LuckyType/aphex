// SvelteKit's `$app/state` for component tests, which run outside an app
// (vite.config.ts aliases it here under Vitest only).
export const page = {
	url: new URL('http://localhost/admin'),
	params: {} as Record<string, string>,
	data: {} as Record<string, unknown>,
	state: {} as Record<string, unknown>
};

// A `$app/state` whose `page.url` a test can move, so a component's URL
// effects rerun as they do on a SvelteKit navigation.
export const page = $state({
	url: new URL('http://localhost/admin'),
	params: {} as Record<string, string>,
	data: {} as Record<string, unknown>,
	state: {} as Record<string, unknown>
});

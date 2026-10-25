/** One entry of a document's history, as the versions list returns it. */
export interface VersionEntry {
	versionNumber: number;
	eventType: string;
	data?: unknown;
}

export interface VersionSummary {
	/**
	 * The top-level fields this version changed: a draft against the
	 * version just before it, a publish against the publish before it (what
	 * visitors saw until then). Null when the history holds nothing earlier
	 * to compare with.
	 */
	changed: string[] | null;
	/** True for the publish whose content is the published document now. */
	current: boolean;
}

function same(a: unknown, b: unknown): boolean {
	return stableJson(a) === stableJson(b);
}

function stableJson(value: unknown): string {
	return JSON.stringify(value, (_key, inner) =>
		inner && typeof inner === 'object' && !Array.isArray(inner)
			? Object.fromEntries(Object.entries(inner).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
			: inner
	);
}

function changedFields(
	before: unknown,
	after: unknown,
	fields: readonly string[] | null
): string[] {
	const a = (before ?? {}) as Record<string, unknown>;
	const b = (after ?? {}) as Record<string, unknown>;
	const names = fields ?? [...new Set([...Object.keys(a), ...Object.keys(b)])];
	return names.filter((name) => !same(a[name] ?? null, b[name] ?? null));
}

/**
 * What each version in `versions` (newest first, as listed) changed, and
 * which one is published now. `fields` names the fields to compare, in
 * the order they are named (the schema's order); left out, every key is
 * compared. `published` says whether the document is published at all:
 * an unpublished document has no current publish.
 */
export function summarizeVersions(
	versions: readonly VersionEntry[],
	options: { fields?: readonly string[] | null; published: boolean }
): Map<number, VersionSummary> {
	const summaries = new Map<number, VersionSummary>();
	const fields = options.fields ?? null;
	const newestPublish = versions.find((v) => v.eventType === 'publish');
	versions.forEach((version, index) => {
		const earlier = versions.slice(index + 1);
		const before =
			version.eventType === 'publish' ? earlier.find((v) => v.eventType === 'publish') : earlier[0];
		summaries.set(version.versionNumber, {
			changed: before ? changedFields(before.data, version.data, fields) : null,
			current: options.published && version === newestPublish
		});
	});
	return summaries;
}

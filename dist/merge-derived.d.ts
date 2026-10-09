/**
 * Carrying server-derived data across the live-preview swap.
 *
 * ## The problem
 *
 * `usePreview().live(fallback)` hands the page the document the studio is
 * holding, so an editor sees their keystrokes immediately. That document comes
 * straight from the editor's form state: it has never been through a page load,
 * and so it carries only what the schema declares.
 *
 * Real pages need more than that. Server-side loads routinely *derive* data and
 * attach it to the document — the posts an archive block queries for, the form a
 * form block embeds, a resolved reference, a computed URL. By convention those
 * are underscore-prefixed (`_posts`, `_form`) precisely because they exist in no
 * schema and are never written back.
 *
 * Swapping the whole document therefore drops all of it, and the block renders
 * empty. That is the worst possible failure to show an author: an archive that
 * says "no posts" in preview while the published page lists twelve, with nothing
 * on screen to suggest the difference is preview itself.
 *
 * ## The rule
 *
 * Keep the live document, and restore only keys that are **underscore-prefixed**,
 * **not structural**, and **absent from the live document**.
 *
 * Each condition is load-bearing:
 *
 * - *Underscore-prefixed* is what separates derived data from authored content.
 *   An authored field is never underscore-prefixed, so clearing one in the editor
 *   still clears it in preview — a naive "fill in whatever's missing" merge would
 *   resurrect every value the author just deleted, which is a far worse bug than
 *   the one being fixed.
 * - *Not structural* excludes `_type`, `_key` and `_ref`, which describe the
 *   document rather than decorate it. They're always present on the live document
 *   anyway; excluding them explicitly means this can't quietly rewrite a block's
 *   identity if that ever stops being true.
 * - *Absent* means this only fills gaps. Once preview and load agree on a key,
 *   the live value wins.
 *
 * Arrays are matched by `_key`, the stable per-item identity, so reordering,
 * inserting and deleting rows all behave.
 *
 * Derived values are necessarily one load stale — change an archive's category
 * filter and it keeps showing the previous query's posts until the page reloads.
 * That is the right trade: stale-but-real content beats an empty grid, and every
 * authored field around it still updates live.
 */
/**
 * Merge server-derived data from `fallback` into the live document.
 *
 * Returns `live` unchanged (same identity) when there is nothing to restore.
 */
export declare function mergeDerived<T>(live: T, fallback: T): T;
//# sourceMappingURL=merge-derived.d.ts.map
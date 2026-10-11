---
'@aphexcms/cms-core': minor
---

- The pane layout reserves no width for a types column it does not draw (a single-type space, focus and presentation mode), so the document list no longer collapses beside an editor at about 1280px. The collapse math moved to a pure `computePaneLayout`.
- Discarding a draft refreshes the document list and no longer shows the badge as autosaved.
- Screen reader text goes through `t()`: drag instructions and announcements in array fields (naming the item's position, not its key), the close button of the schedule and upload dialogs, the sidebar toggle, and the calendar's month buttons and grid label.
- A slug inside an array item titles a root-level `source` field by its schema title.
- `configureStudio({ listOrderings })` is back: app-side orders for a document list that no stored field holds, offered above the schema's orderings and applied across pages.

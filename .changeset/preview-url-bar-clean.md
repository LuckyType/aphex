---
'@aphexcms/cms-core': patch
---

The preview pane's URL bar shows the page's address without the `?aphex-preview` marker. The iframe still loads with the marker, so draft resolution and the editing overlay are unchanged; only the displayed address is clean. New helper `displayPreviewUrl` in `preview/address.ts`.

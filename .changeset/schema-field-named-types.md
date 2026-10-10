---
'@aphexcms/cms-core': patch
---

The editor's own field check validates array items naming a registered object type through the schema registry, as publish does, so a broken nested item or one deeper than `maxDepth` shows under its field before publish.

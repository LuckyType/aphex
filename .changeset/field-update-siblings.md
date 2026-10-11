---
'@aphexcms/cms-core': patch
---

Add `onUpdateSiblings(patch)` to `FieldComponentProps` and `FieldViewProps`. A widget that fills several neighbours from one action (an address search setting street, city and coordinates) merges them into the object it belongs to as one change, at the top level of the document editor, inside an inline object and inside an array item's modal. Before, a widget could only write its own value.

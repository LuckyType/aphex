---
'@aphexcms/cms-core': minor
---

Add `configureStudio({ documentTrees })`: an app can replace the document list pane for a family of types (say, menus, their sections and their dishes) with its own parent/child tree. Selecting a node opens that document in the ordinary editor beside the tree, and the tree receives a `changes` count that goes up on every write the editor makes, so it can re-read what it shows.

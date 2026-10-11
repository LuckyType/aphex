---
'@aphexcms/cms-core': patch
---

Make two Studio-language fixes take effect that did not. dnd-kit's Accessibility plugin reads its texts only as its manager is built, so passing the plugins to the provider left the English drag instructions and announcements in place; the manager is now built with them, and the drag handle is a named button ("Move item") with a translatable role description instead of an unnamed icon button announced as "draggable". bits-ui merges its own English aria-label over a caller's, so the calendar's month buttons stayed "Previous" and "Next"; they are now drawn through a `child` snippet.

---
'@aphexcms/cms-core': patch
---

Schema labels translated at render time now reach three more places: a type's literal `preview.title` (a singleton's heading), the sidebar's section headings (a type's `group`) and a schema `lock`'s reason on the locked field (through `validationMessage`). `studioLabel(text)` is exported from `@aphexcms/cms-core` and `@aphexcms/cms-core/schema` so a `preview.prepare` can label its own fallback text ("Untitled item") in the Studio's language. An app can register its schemas in one language and translate everything through `configureStudioI18n`.

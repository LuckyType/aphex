---
'@aphexcms/cms-core': minor
---

Add `upload.stripImageMetadata`: uploaded images carrying EXIF (GPS position, device), XMP, IPTC or PNG text are re-encoded in their own format without it before they are stored, upright and with their ICC profile. An image whose metadata cannot be removed (HEIC) is refused with a 422. Off by default.

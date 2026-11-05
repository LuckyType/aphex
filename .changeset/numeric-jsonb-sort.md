---
'@aphexcms/postgresql-adapter': patch
---

`sort` on a data field orders by the field's JSONB value instead of its text, so a number field sorts numerically: `sort: 'order'` over 1 to 12 returned 1, 10, 11, 12, 2. Strings order as before, since Postgres compares JSONB strings with the database collation, as it does text.

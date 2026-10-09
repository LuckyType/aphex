import { Hono } from 'hono';
import type { AphexEnv } from '../index.js';
/**
 * Asset references endpoints. Two distinct paths sharing one router file:
 *   - GET  /:id/references          → docs that reference one asset
 *   - POST /references/counts       → batch reference counts for many ids
 *
 * Mounted under `/assets`, so the wire paths are
 * `/api/assets/:id/references` and `/api/assets/references/counts`.
 *
 * Order matters in createAphexApi(): mount this BEFORE assetsByIdRouter so
 * `/references/counts` doesn't get captured as `:id = "references"`.
 */
export declare const assetsReferencesRouter: Hono<AphexEnv>;
//# sourceMappingURL=assets-references.d.ts.map
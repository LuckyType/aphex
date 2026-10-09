/**
 * Row id holding the one-time bootstrap claim.
 *
 * Deliberately not `'default'` — `get`/`updateInstanceSettings` are scoped to
 * that row, so this one is invisible to them and can't be cleared by an ordinary
 * settings write.
 */
export const BOOTSTRAP_CLAIM_ID = 'aphex:bootstrap-claim';

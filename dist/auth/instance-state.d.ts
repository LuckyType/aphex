import type { DatabaseAdapter } from '../db/interfaces/index.js';
/**
 * True only when the instance is *provably* empty — the adapter can answer the
 * question, and the answer is "no user profiles exist".
 *
 * Returns `false` when the adapter doesn't implement `hasAnyUserProfiles()`,
 * which is the safe direction: bootstrap promotion is skipped and the invite
 * gate stays shut rather than swinging open.
 */
export declare function isInstanceEmpty(db: DatabaseAdapter): Promise<boolean>;
/** Whether the adapter can answer `isInstanceEmpty` at all — for warning about a skipped bootstrap. */
export declare function canDetermineInstanceEmptiness(db: DatabaseAdapter): boolean;
//# sourceMappingURL=instance-state.d.ts.map
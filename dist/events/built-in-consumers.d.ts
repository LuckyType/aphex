import type { EventConsumerPart } from '../plugins/types.js';
/**
 * Erase a deleted user's avatar — the file, not just the row.
 *
 * Account deletion removes the user record, and with it the only pointer to the avatar
 * asset. Without this the image survives in object storage indefinitely, reachable by
 * anyone holding its URL and invisible to the media browser (avatars are marked
 * `system`), so nothing would ever surface it for cleanup. That is precisely the
 * "personal data with no way left to find or erase it" case a right-to-erasure request
 * has to be able to answer.
 *
 * Idempotent, as every consumer must be: a missing asset is a completed erasure, so a
 * redelivery finds nothing and succeeds. It throws only when the delete itself fails, so
 * a transient storage outage retries with backoff instead of silently giving up — the
 * one outcome that would leave the data behind while reporting success.
 */
export declare const eraseUserAvatarConsumer: EventConsumerPart;
/** Every consumer core ships. Seeded into the part resolver ahead of plugin parts. */
export declare const BUILT_IN_EVENT_CONSUMERS: readonly EventConsumerPart[];
//# sourceMappingURL=built-in-consumers.d.ts.map
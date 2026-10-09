// Access control utilities.
//
// These are thin wrappers over the capability system. They exist so callers
// don't need to import `hasCapability` + a specific capability string for the
// common "can this user do X" branching in server loads and UI gating.
//
// Capabilities are resolved once per request by the auth hook and stored on
// `auth.capabilities`, so these remain synchronous.
import { hasCapability } from './capabilities.js';
/**
 * Does the user have *any* mutating capability?
 *
 * Coarse-grained on purpose: this is for UI gating where you just want to
 * decide whether to show the entire edit/upload surface. Don't use it to
 * authorise a specific mutation — the server's PermissionChecker does that
 * per-operation (canCreate vs canUpdate vs canDelete, etc).
 */
export function canWrite(auth) {
    return (hasCapability(auth, 'document.create') ||
        hasCapability(auth, 'document.update') ||
        hasCapability(auth, 'document.delete') ||
        hasCapability(auth, 'asset.upload'));
}
/**
 * Can the user manage organization members (invite / remove / change role)?
 */
export function canManageMembers(auth) {
    return (hasCapability(auth, 'member.invite') ||
        hasCapability(auth, 'member.remove') ||
        hasCapability(auth, 'member.changeRole'));
}
/**
 * Can the user manage API keys?
 */
export function canManageApiKeys(auth) {
    return hasCapability(auth, 'apiKey.manage');
}
/**
 * Is this session effectively read-only?
 *
 * Inverse of `canWrite`. Named for historical reasons — prefer `canWrite()`
 * for positive checks; `isViewer()` remains available for call sites that
 * read more naturally in the negative (e.g. `isReadOnly={isViewer(auth)}`).
 */
export function isViewer(auth) {
    return !canWrite(auth);
}

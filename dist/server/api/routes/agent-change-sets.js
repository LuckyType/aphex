import { Hono } from 'hono';
import { z } from 'zod';
import { authToContext } from '../../../local-api/auth-helpers.js';
import { hasCapability } from '../../../types/capabilities.js';
import { RevisionConflictError } from '../../../db/interfaces/index.js';
import { cmsLogger } from '../../../utils/logger.js';
import { withCreatedByNames } from './resolve-created-by.js';
/** Exported for the OpenAPI registry — see the note in `routes/jobs.ts`. */
export const listChangeSetsQuery = z.object({
    limit: z.coerce.number().int().min(1).max(200).optional(),
    offset: z.coerce.number().int().min(0).optional()
});
/** Map an adapter Page into the ApiResponse `pagination` shape the client expects. */
function toPagination(page) {
    const pageSize = page.limit || 1;
    return {
        total: page.total,
        page: Math.floor(page.offset / pageSize) + 1,
        pageSize,
        totalPages: Math.max(1, Math.ceil(page.total / pageSize)),
        hasNextPage: page.offset + page.limit < page.total,
        hasPrevPage: page.offset > 0
    };
}
export const agentChangeSetsRouter = new Hono()
    // Read-only audit history — visible to anyone who can read content, same posture as
    // GET /api/jobs · /api/events (jobs.ts's requireHistoryAccess).
    .get('/change-sets', async (c) => {
    const auth = c.var.auth;
    if (!auth || auth.type === 'partial_session') {
        return c.json({ success: false, error: 'Authentication required' }, 401);
    }
    if (!hasCapability(auth, 'document.read')) {
        return c.json({ success: false, error: 'Insufficient permissions' }, 403);
    }
    const q = listChangeSetsQuery.safeParse(c.req.query());
    if (!q.success) {
        return c.json({ success: false, error: 'Invalid query parameters', issues: q.error.issues }, 400);
    }
    const { organizationId } = authToContext(auth);
    const page = await c.var.aphexCMS.databaseAdapter.listChangeSets({
        organizationId,
        limit: q.data.limit,
        offset: q.data.offset
    });
    const items = await withCreatedByNames(page.items, c.var.aphexCMS.auth);
    return c.json({ success: true, data: items, pagination: toPagination(page) });
})
    .get('/change-sets/:id', async (c) => {
    const auth = c.var.auth;
    if (!auth || auth.type === 'partial_session') {
        return c.json({ success: false, error: 'Authentication required' }, 401);
    }
    if (!hasCapability(auth, 'document.read')) {
        return c.json({ success: false, error: 'Insufficient permissions' }, 403);
    }
    const { organizationId } = authToContext(auth);
    const changeSet = await c.var.aphexCMS.databaseAdapter.getChangeSet(organizationId, c.req.param('id'));
    if (!changeSet)
        return c.json({ success: false, error: 'Not found' }, 404);
    const [withName] = await withCreatedByNames([changeSet], c.var.aphexCMS.auth);
    return c.json({ success: true, data: withName });
})
    // Undo a whole turn: for every operation that mutated a document and has a
    // `versionBefore` (create_document operations don't — see agent-change-sets.ts's doc
    // comment), restore that document to it, in reverse order. Reuses the exact CAS-guarded
    // primitive DocumentEditor's own version-restore already calls — undo is itself just
    // another version-tracked draft write, not bespoke revert logic. A conflict (someone
    // edited the document since the agent touched it) is reported per-operation rather than
    // aborting the rest of the undo.
    .post('/change-sets/:id/undo', async (c) => {
    const auth = c.var.auth;
    if (!auth || auth.type === 'partial_session') {
        return c.json({ success: false, error: 'Authentication required' }, 401);
    }
    if (!hasCapability(auth, 'document.update')) {
        return c.json({ success: false, error: 'Insufficient permissions' }, 403);
    }
    const context = authToContext(auth);
    const { databaseAdapter, localAPI } = c.var.aphexCMS;
    const changeSet = await databaseAdapter.getChangeSet(context.organizationId, c.req.param('id'));
    if (!changeSet)
        return c.json({ success: false, error: 'Not found' }, 404);
    const undoable = changeSet.operations
        .filter((op) => op.success && op.versionBefore !== null)
        .reverse();
    const results = [];
    for (const op of undoable) {
        try {
            const collection = localAPI.getCollection(op.collection);
            if (!collection) {
                results.push({
                    operationId: op.id,
                    documentId: op.documentId,
                    success: false,
                    error: `Unknown collection: ${op.collection}`
                });
                continue;
            }
            // Fetch the current revision fresh on every iteration — undoing the previous
            // operation in this same loop changes it, so a value read before the loop
            // started would be stale by the time we get here.
            const current = await collection.findByID(context, op.documentId);
            const restored = await localAPI.versionService.restoreVersion(databaseAdapter, context.organizationId, op.documentId, op.versionBefore, context.user?.id, current?._meta?.revision);
            results.push({
                operationId: op.id,
                documentId: op.documentId,
                success: restored !== null,
                error: restored === null ? 'Version not found or restore failed' : undefined
            });
        }
        catch (err) {
            if (err instanceof RevisionConflictError) {
                results.push({
                    operationId: op.id,
                    documentId: op.documentId,
                    success: false,
                    error: `Changed since the agent's edit (conflict): ${err.message}`
                });
                continue;
            }
            cmsLogger.error('[agent-change-sets] undo failed for operation:', op.id, err);
            results.push({
                operationId: op.id,
                documentId: op.documentId,
                success: false,
                error: err instanceof Error ? err.message : 'Unknown error'
            });
        }
    }
    return c.json({ success: true, data: { results } });
});

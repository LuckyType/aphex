/**
 * Thrown when a write's `expectedRevision` no longer matches the document's
 * current revision — another writer (a second tab, an AI agent, a concurrent
 * request) saved in between the caller's read and this write. Callers should
 * surface this distinctly from a validation error: re-fetch and let the user
 * decide, never silently retry with an overwrite.
 */
export class RevisionConflictError extends Error {
    documentId;
    expectedRevision;
    currentRevision;
    constructor(message, documentId, expectedRevision, currentRevision) {
        super(message);
        this.documentId = documentId;
        this.expectedRevision = expectedRevision;
        this.currentRevision = currentRevision;
        this.name = 'RevisionConflictError';
    }
}

import type { AgentChangeSet, AgentChangeSetWithOperations, AgentOperation, CreateAgentChangeSetInput, CompleteAgentChangeSetInput, RecordAgentOperationInput, ListAgentChangeSetsOptions } from '../../types/agent-change-sets.js';
import type { Page } from '../../types/events.js';
export interface AgentChangeSetAdapter {
    /** One row per agent turn, created eagerly before the model is called. */
    createChangeSet(input: CreateAgentChangeSetInput): Promise<AgentChangeSet>;
    /** Record one mutating tool call's outcome against an existing change-set. */
    recordOperation(input: RecordAgentOperationInput): Promise<AgentOperation>;
    /** Finalize a change-set once the turn ends, with its accumulated token totals. */
    completeChangeSet(organizationId: string, id: string, input: CompleteAgentChangeSetInput): Promise<void>;
    /** Read one change-set with its operations (org-scoped) — what the undo endpoint acts on. */
    getChangeSet(organizationId: string, id: string): Promise<AgentChangeSetWithOperations | null>;
    /** List change-sets for the org, newest first (the activity view's "Agent Changes" tab).
     * Includes each change-set's operations so the list can show what a turn did (e.g.
     * "create_document") without a per-row detail fetch. */
    listChangeSets(options: ListAgentChangeSetsOptions): Promise<Page<AgentChangeSetWithOperations>>;
}
//# sourceMappingURL=agent-change-sets.d.ts.map
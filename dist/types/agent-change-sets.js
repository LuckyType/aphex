// Dialect-agnostic shapes for the agent audit/undo trail — mirrors `types/events.ts`'s
// relationship to `cms_domain_events`/`cms_jobs`, but for `cms_agent_change_sets`/
// `cms_agent_operations`. One `AgentChangeSet` row per agent turn (not per mutation — a
// pure Q&A turn still costs tokens and is still worth an audit/cost row), with zero or more
// `AgentOperation` children recording the mutating tool calls that turn made.
export {};

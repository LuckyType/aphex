// Policy runner for the reject-only seam (DocumentPolicies) and the server
// side of DocumentType.lock. Both live beside the hooks runner on purpose: the
// hooks transform, these refuse, and neither reacts.
import type { DatabaseAdapter } from '../db/interfaces/index';
import type { Document } from '../types/document';
import type { Auth } from '../types/auth';
import { effectiveOrganizationRole } from '../types/capabilities';
import type {
	DocumentLock,
	DocumentPolicies,
	DocumentPolicy,
	DocumentPolicyContext,
	PolicyWriter,
	SchemaType
} from '../types/schemas';

/**
 * Thrown when a policy or a lock refuses a write. Carries the operation and
 * the reason the policy gave, which is what the caller is shown. Routes map it
 * to 409: the request was well formed and allowed, the document's state is
 * what stands in the way.
 */
export class DocumentPolicyError extends Error {
	constructor(
		readonly operation: 'create' | 'update' | 'publish' | 'unpublish' | 'delete',
		readonly reason: string,
		/** The locked fields the write tried to change, when a lock refused it. */
		readonly lockedFields: readonly string[] = []
	) {
		super(reason);
		this.name = 'DocumentPolicyError';
	}
}

const phaseOf = {
	create: 'beforeWrite',
	update: 'beforeWrite',
	publish: 'beforePublish',
	unpublish: 'beforeUnpublish',
	delete: 'beforeDelete'
} as const;

/**
 * Run the config's policies, then the schema's, for one operation; the first
 * refusal wins. A policy that throws propagates as is, so a policy may also
 * throw its own typed error.
 */
export async function runDocumentPolicies(
	sources: ReadonlyArray<DocumentPolicies | undefined>,
	ctx: DocumentPolicyContext
): Promise<void> {
	const phase = phaseOf[ctx.operation];
	for (const source of sources) {
		for (const policy of (source?.[phase] ?? []) as DocumentPolicy[]) {
			const refusal = await policy(ctx);
			if (typeof refusal === 'string' && refusal.length > 0) {
				throw new DocumentPolicyError(ctx.operation, refusal);
			}
		}
	}
}

/** What a policy may know of the caller: its org, user and effective role. */
export function policyWriter(context: {
	organizationId: string;
	user?: { id: string } | null;
	auth?: Auth;
	overrideAccess?: boolean;
}): PolicyWriter {
	if (context.overrideAccess) {
		return { organizationId: context.organizationId, userId: context.user?.id, system: true };
	}
	return {
		organizationId: context.organizationId,
		userId: context.user?.id,
		role: context.auth ? effectiveOrganizationRole(context.auth) : null
	};
}

/** The policy context for a stored document about to change state. */
export function policyContext(
	operation: DocumentPolicyContext['operation'],
	schema: SchemaType,
	document: Pick<Document, 'id' | 'draftData' | 'publishedData'>,
	context: {
		organizationId: string;
		user?: { id: string } | null;
		actorId?: string | null;
		auth?: Auth;
		overrideAccess?: boolean;
	},
	databaseAdapter: DatabaseAdapter,
	data?: Record<string, unknown>
): DocumentPolicyContext {
	return {
		operation,
		documentId: document.id,
		data: data ?? (document.draftData as Record<string, unknown>) ?? {},
		publishedData: (document.publishedData as Record<string, unknown> | null) ?? null,
		...(operation === 'create' || operation === 'update'
			? { previousData: (document.draftData as Record<string, unknown> | null) ?? null }
			: {}),
		context: policyWriter(context),
		schema,
		databaseAdapter
	};
}

function sameValue(a: unknown, b: unknown): boolean {
	return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

/**
 * The locked fields whose stored value `next` would change. The Studio hides
 * the control; this is the check that makes the lock hold for a caller that
 * never saw the Studio.
 */
export function lockedFieldChanges(
	lock: DocumentLock | null | undefined,
	current: Record<string, unknown> | null | undefined,
	next: Record<string, unknown>
): string[] {
	if (!lock) return [];
	return lock.fields.filter((field) => !sameValue(current?.[field], next[field]));
}

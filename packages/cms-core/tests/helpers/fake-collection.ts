/**
 * A CollectionAPI over an in-memory adapter, for tests that pin what a write
 * path does around the row: the events it appends in the same transaction, the
 * policies it runs, the lock it enforces. The adapter is the smallest surface
 * the write paths touch; `withTransaction` hands back the adapter itself, so a
 * fact "written on the tx handle" is one recorded here.
 */
import { CollectionAPI } from '../../src/lib/local-api/collection-api';
import { PermissionChecker } from '../../src/lib/local-api/permissions';
import type { LocalAPIContext } from '../../src/lib/local-api/types';
import type { DatabaseAdapter } from '../../src/lib/db/index';
import type { Document } from '../../src/lib/types/document';
import type { AppendEventInput } from '../../src/lib/types/events';
import type { SchemaType } from '../../src/lib/types/schemas';
import type { CMSConfig } from '../../src/lib/types/config';

export interface FakeStore {
	docs: Map<string, Document>;
	events: AppendEventInput[];
	adapter: DatabaseAdapter;
}

export function fakeStore(): FakeStore {
	const docs = new Map<string, Document>();
	const events: AppendEventInput[] = [];
	let nextId = 1;
	const adapter = {
		async withTransaction<T>(fn: (tx: DatabaseAdapter) => Promise<T>): Promise<T> {
			return fn(adapter);
		},
		async appendEvent(input: AppendEventInput) {
			events.push(input);
			return { id: `evt-${events.length}`, createdAt: new Date(), ...input };
		},
		async createDocument(input: {
			organizationId: string;
			type: string;
			draftData: Record<string, unknown>;
			createdBy?: string;
			id?: string;
		}) {
			const doc: Document = {
				id: input.id ?? `doc-${nextId++}`,
				organizationId: input.organizationId,
				type: input.type,
				status: 'draft',
				draftData: input.draftData,
				publishedData: null,
				publishedHash: null,
				revision: 1,
				createdBy: input.createdBy ?? null,
				updatedBy: input.createdBy ?? null,
				createdAt: new Date(),
				updatedAt: new Date(),
				publishedAt: null
			} as Document;
			docs.set(doc.id, doc);
			return doc;
		},
		async findByDocIdAdvanced(_org: string, id: string) {
			return docs.get(id) ?? null;
		},
		async updateDocDraft(_org: string, id: string, data: Record<string, unknown>, userId?: string) {
			const doc = docs.get(id);
			if (!doc) return null;
			const saved = {
				...doc,
				draftData: data,
				revision: doc.revision + 1,
				updatedBy: userId ?? doc.updatedBy
			} as Document;
			docs.set(id, saved);
			return saved;
		},
		async publishDoc(_org: string, id: string) {
			const doc = docs.get(id);
			if (!doc) return null;
			const published = {
				...doc,
				status: 'published',
				publishedData: doc.draftData,
				publishedHash: 'hash'
			} as Document;
			docs.set(id, published);
			return published;
		},
		async unpublishDoc(_org: string, id: string) {
			const doc = docs.get(id);
			if (!doc) return null;
			const unpublished = {
				...doc,
				status: 'draft',
				publishedData: null,
				publishedHash: null
			} as Document;
			docs.set(id, unpublished);
			return unpublished;
		},
		async deleteDocById(_org: string, id: string) {
			return docs.delete(id);
		},
		async listJobs() {
			return { items: [], total: 0 };
		}
	} as unknown as DatabaseAdapter;
	return { docs, events, adapter };
}

export function fakeCollection<T = Record<string, unknown>>(
	schema: SchemaType,
	store: FakeStore,
	config: Partial<CMSConfig> = {},
	registry: SchemaType[] = [schema]
): CollectionAPI<T> {
	const fullConfig = { schemaTypes: registry, database: store.adapter, ...config } as CMSConfig;
	const permissions = new PermissionChecker(
		fullConfig,
		new Map(registry.filter((s) => s.type === 'document').map((s) => [s.name, s]))
	);
	return new CollectionAPI<T>(
		schema.name,
		store.adapter,
		schema,
		permissions,
		null,
		undefined,
		undefined,
		undefined,
		registry,
		fullConfig.policies
	);
}

export const systemCtx: LocalAPIContext = {
	organizationId: 'org-1',
	overrideAccess: true,
	user: { id: 'user-1', email: 'a@b.com', name: 'A' } as LocalAPIContext['user']
};

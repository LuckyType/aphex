import type { Document } from '../../types/index.js';
import type { DocumentAdapter } from '../interfaces/document.js';
interface ResolveOptions {
    depth: number;
    currentDepth?: number;
    visited?: Set<string>;
}
/**
 * Recursively resolves reference fields in a document. Both singular and
 * array refs share the on-disk shape `{ _type: 'reference', _ref }`, so the
 * resolver finds them by that marker and replaces the entire object with
 * the fetched document.
 */
export declare function resolveReferences(document: Document, adapter: DocumentAdapter, organizationId: string, options: ResolveOptions): Promise<Document>;
export {};
//# sourceMappingURL=reference-resolver.d.ts.map
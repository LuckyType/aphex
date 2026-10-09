import type { DocumentHook, DocumentHookArgs } from '../types/schemas.js';
/**
 * Run a phase of document hooks in order, threading the (possibly transformed)
 * data through each. Returns the final data. A hook that throws aborts the write.
 */
export declare function runDocumentHooks(hooks: DocumentHook[] | undefined, args: DocumentHookArgs): Promise<Record<string, unknown>>;
//# sourceMappingURL=hooks.d.ts.map
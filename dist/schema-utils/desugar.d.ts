import type { Field, SchemaType } from '../types/schemas.js';
export interface DesugarOptions {
    /** The authored `type` keyword to replace, e.g. `'color'`. */
    type: string;
    /**
     * Build the replacement from the authored field. Own the *shape* only — `type`,
     * `fields`, and the default `input`/`inputOptions`. Anything you copy off the
     * authored field here is redundant: it is layered back on afterwards.
     */
    build: (authored: Field) => Field;
    /**
     * Keys that exist only on the sugar type and must not survive onto the expanded
     * field (e.g. color's `alpha`, which becomes `inputOptions.alpha`). Everything
     * else the author wrote is preserved.
     */
    sugarKeys?: readonly string[];
}
/**
 * Desugar every `{ type: <options.type> }` field across a schema list, recursing into
 * nested objects and array members, preserving everything the author declared.
 *
 * Intended as the body of an `aphex/schema/transform` part, so it runs identically in
 * the engine, the admin, and the type generator — nothing downstream ever sees the
 * sugar keyword.
 */
export declare function desugarFieldType(schemas: SchemaType[], options: DesugarOptions): SchemaType[];
//# sourceMappingURL=desugar.d.ts.map
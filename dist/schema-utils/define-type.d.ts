import type { Field, SchemaType, SchemaHooks, InferFields } from '../types/schemas.js';
/**
 * Define a schema with hooks typed from its own fields.
 *
 * @example
 * ```ts
 * export default defineType({
 *   type: 'document',
 *   name: 'contactSubmission',
 *   title: 'Contact Submission',
 *   fields: [
 *     { name: 'email', type: 'string', title: 'Email' },
 *     { name: 'subscribed', type: 'boolean', title: 'Subscribed' }
 *   ],
 *   hooks: {
 *     beforeValidate: [
 *       // `data.email` is `string | undefined`, `data.subscribed` is `boolean | undefined`
 *       ({ data }) => ({ ...data, email: data.email?.trim().toLowerCase() })
 *     ]
 *   }
 * });
 * ```
 *
 * The `const` type parameter preserves the field literals; `hooks` uses the
 * inferred type through a mapped type (a non-inferential position), so `fields`
 * is the sole inference site and `data` is contextually typed from it.
 */
export declare function defineType<const F extends readonly Field[]>(schema: Omit<SchemaType, 'fields' | 'hooks'> & {
    fields: F;
    hooks?: SchemaHooks<InferFields<F>>;
}): SchemaType;
//# sourceMappingURL=define-type.d.ts.map
import type { Field } from '../types/schemas.js';
import type { FormDefinition } from './types.js';
/**
 * Define a form whose submission type is inferred from its own fields.
 *
 * @example
 * ```ts
 * export const contactForm = defineForm({
 *   id: 'contact',
 *   title: 'Contact us',
 *   fields: [
 *     { name: 'name', type: 'string', title: 'Name', validation: (R) => R.required() },
 *     { name: 'email', type: 'string', title: 'Email', validation: (R) => R.required().email() },
 *     { name: 'message', type: 'text', title: 'Message', validation: (R) => R.required() }
 *   ]
 * });
 *
 * type ContactSubmission = InferForm<typeof contactForm>;
 * // { name?: string; email?: string; message?: string }
 * ```
 */
export declare function defineForm<const F extends readonly Field[]>(form: Omit<FormDefinition, 'fields'> & {
    fields: F;
}): FormDefinition<F>;
//# sourceMappingURL=define-form.d.ts.map
import { validateDocumentData } from '../field-validation/utils.js';
/** Adapt a form to a schema-like object so the field validator can run against it. */
function formToSchema(form) {
    return {
        type: 'object',
        name: form.id,
        title: form.title,
        fields: [...form.fields]
    };
}
/**
 * Validate raw submission data against a form's fields. Returns the standard
 * `DocumentValidationResult` (`isValid`, field-keyed `errors`, `normalizedData`) — the core
 * submit path rejects on `!isValid` and stores/emits from `normalizedData`.
 */
export function validateFormData(form, data) {
    return validateDocumentData(formToSchema(form), data);
}

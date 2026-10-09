import type { FormDefinition } from './types.js';
import { type DocumentValidationResult } from '../field-validation/utils.js';
/**
 * Validate raw submission data against a form's fields. Returns the standard
 * `DocumentValidationResult` (`isValid`, field-keyed `errors`, `normalizedData`) — the core
 * submit path rejects on `!isValid` and stores/emits from `normalizedData`.
 */
export declare function validateFormData(form: FormDefinition, data: Record<string, unknown>): Promise<DocumentValidationResult>;
//# sourceMappingURL=validate.d.ts.map
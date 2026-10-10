/**
 * The editor reads a 409 as "changed elsewhere, reload" only when it is a
 * revision conflict. A policy refusal or unpublished references also answer
 * 409, and showing those as a conflict would send the editor to reload a
 * document that reloading cannot fix.
 *
 * Lives in tests/ (not src/) so the package build never compiles it into dist.
 */
import { describe, expect, it } from 'vitest';
import { ApiError, isRevisionConflict } from '../src/lib/api/client';

describe('isRevisionConflict', () => {
	it('is true for the body a RevisionConflictError answers with', () => {
		const err = new ApiError(409, { success: false, error: 'Conflict', currentRevision: 4 });
		expect(isRevisionConflict(err)).toBe(true);
	});

	it('is false for a policy refusal and for unpublished references', () => {
		expect(
			isRevisionConflict(
				new ApiError(409, { success: false, error: 'Refused by policy', message: 'No' }, 'No')
			)
		).toBe(false);
		expect(
			isRevisionConflict(
				new ApiError(409, { success: false, error: 'Unpublished references', references: [] })
			)
		).toBe(false);
	});

	it('is false for other statuses and for errors that are not ApiError', () => {
		expect(isRevisionConflict(new ApiError(403, { error: 'Conflict' }))).toBe(false);
		expect(isRevisionConflict(new Error('Conflict'))).toBe(false);
	});
});

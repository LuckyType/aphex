import { describe, expect, it } from 'vitest';
import {
	claimConfirmDialogHost,
	isActiveConfirmDialogHost,
	releaseConfirmDialogHost
} from '../src/lib/components/admin/confirm-dialog/confirm-dialog.svelte';

describe('confirm dialog host claim', () => {
	it('lets only the first mounted host render', () => {
		const first = claimConfirmDialogHost();
		const second = claimConfirmDialogHost();
		expect(isActiveConfirmDialogHost(first)).toBe(true);
		expect(isActiveConfirmDialogHost(second)).toBe(false);
		releaseConfirmDialogHost(second);
		releaseConfirmDialogHost(first);
	});

	it('hands over to the next host when the first unmounts', () => {
		const first = claimConfirmDialogHost();
		const second = claimConfirmDialogHost();
		releaseConfirmDialogHost(first);
		expect(isActiveConfirmDialogHost(second)).toBe(true);
		releaseConfirmDialogHost(second);
	});

	it('ignores releasing a host twice', () => {
		const first = claimConfirmDialogHost();
		const second = claimConfirmDialogHost();
		releaseConfirmDialogHost(first);
		releaseConfirmDialogHost(first);
		expect(isActiveConfirmDialogHost(second)).toBe(true);
		releaseConfirmDialogHost(second);
	});
});

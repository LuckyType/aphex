import { describe, expect, it } from 'vitest';
import { revalidateRejectedUploads, type RejudgeableUpload } from '../src/lib/utils/upload-queue';

describe('revalidateRejectedUploads', () => {
	it('re-queues a row the browser checks rejected once it passes', () => {
		const items: RejudgeableUpload[] = [{ status: 'rejected', error: 'Too large' }];
		expect(revalidateRejectedUploads(items, () => undefined)).toBe(true);
		expect(items[0]).toEqual({ status: 'pending', error: undefined });
	});

	it('refreshes the reason of a row that is still rejected', () => {
		const items: RejudgeableUpload[] = [{ status: 'rejected', error: 'old' }];
		expect(revalidateRejectedUploads(items, () => 'new')).toBe(true);
		expect(items[0].error).toBe('new');
		expect(revalidateRejectedUploads(items, () => 'new')).toBe(false);
	});

	it('never re-queues a row the server refused', () => {
		const items: RejudgeableUpload[] = [
			{ status: 'rejected', error: 'File type is not allowed', serverRejected: true }
		];
		expect(revalidateRejectedUploads(items, () => undefined)).toBe(false);
		expect(items[0]).toEqual({
			status: 'rejected',
			error: 'File type is not allowed',
			serverRejected: true
		});
	});

	it('leaves rows in other states alone', () => {
		const items: RejudgeableUpload[] = [{ status: 'failed', error: 'timeout' }, { status: 'done' }];
		expect(revalidateRejectedUploads(items, () => undefined)).toBe(false);
		expect(items.map((i) => i.status)).toEqual(['failed', 'done']);
	});
});

/** The part of an upload queue row that re-judging a rejection reads and writes. */
export interface RejudgeableUpload {
	status: 'pending' | 'uploading' | 'done' | 'rejected' | 'failed';
	error?: string;
	/**
	 * Set when the server refused the file. Such a refusal is final for the row:
	 * the browser-side checks can't see what the server objected to (the file's
	 * real content, a per-field rule), so they would pass it and the identical
	 * bytes would be sent again, only to be refused again.
	 */
	serverRejected?: boolean;
}

/**
 * Re-run the browser-side preconditions over rows rejected by them, putting a
 * row back to `pending` when it now passes and refreshing its reason when that
 * changed. Rows the server refused are left alone. Mutates the rows in place
 * and returns whether any changed.
 */
export function revalidateRejectedUploads<T extends RejudgeableUpload>(
	items: T[],
	rejection: (item: T) => string | undefined
): boolean {
	let changed = false;
	for (const item of items) {
		if (item.status !== 'rejected' || item.serverRejected) continue;
		const reason = rejection(item);
		if (!reason) {
			item.status = 'pending';
			item.error = undefined;
			changed = true;
		} else if (reason !== item.error) {
			item.error = reason;
			changed = true;
		}
	}
	return changed;
}

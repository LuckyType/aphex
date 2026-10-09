/**
 * Where the schedule dialog's picker starts: the already scheduled time when
 * rescheduling one that is still ahead, otherwise one hour from now.
 */
export function initialScheduleRunAt(initialRunAt: string | undefined, now: Date): Date {
	if (initialRunAt) {
		const scheduled = new Date(initialRunAt);
		if (!Number.isNaN(scheduled.getTime()) && scheduled.getTime() >= now.getTime()) {
			return scheduled;
		}
	}
	return new Date(now.getTime() + 60 * 60 * 1000);
}

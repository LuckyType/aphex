/**
 * How long to wait on a request carrying a file body.
 *
 * Its own module because both transports need it — the XHR upload path and the
 * fetch client — and a second copy of a heuristic is a second thing to get
 * wrong. No imports, so neither pays for it.
 *
 * Derived from the payload rather than configured. A timeout encodes no
 * decision the way a size limit does: its only job is to stop a hung request
 * spinning forever. Exposing it as a setting invites an inconsistent pair —
 * raise `upload.maxFileSize` to 100MB, leave the timeout at the JSON default,
 * and every large upload fails in a way that reads as a server rejection.
 * Deriving it means raising the size limit adjusts the deadline for free.
 */
export declare function uploadTimeoutForBytes(bytes: number): number;
export declare function uploadTimeoutFor(body: FormData): number;
//# sourceMappingURL=upload-timeout.d.ts.map
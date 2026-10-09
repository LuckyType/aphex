export declare const MAX_REMOTE_FILE_BYTES: number;
export interface RemoteFile {
    buffer: Buffer;
    contentType: string | null;
}
/** Fetch a URL with SSRF guards: http(s)-only, private/link-local/multicast IPs blocked and the
 * validated address pinned for the actual connection (re-checked and re-pinned on every redirect
 * hop), a request timeout, and a streamed size cap (not just a Content-Length check, since that
 * header can lie). */
export declare function fetchRemoteFile(url: string): Promise<RemoteFile>;
//# sourceMappingURL=fetch-remote-file.d.ts.map
/**
 * Read a video's duration, real pixel dimensions and a representative frame —
 * in the browser, from the file the user just picked.
 *
 * Done here rather than on the server because the alternative is ffmpeg: a large
 * native dependency, awkward on serverless, and a build-time burden for every
 * self-hoster who never uploads a video. The browser already has a demuxer and a
 * decoder for exactly the formats it can play, and at upload time the file is
 * local — no download, no storage round-trip.
 *
 * What it cannot do is the honest tradeoff: a codec this browser can't decode
 * (or a server-side/API upload, which never runs this) yields nothing. Every
 * field is therefore optional, and callers must render a video with no poster
 * and no duration rather than treating absence as an error.
 */
export interface VideoInfo {
    /** Seconds. Absent for streams the browser reports as unbounded or unknown. */
    duration?: number;
    width?: number;
    height?: number;
    /** A frame from early in the video, for use as a poster. */
    poster?: Blob;
}
export declare function extractVideoInfo(file: File): Promise<VideoInfo>;
/**
 * Read duration, dimensions and a poster frame from a video already in storage.
 *
 * For assets uploaded before posters existed, or through the API, where no
 * browser ever saw the file. Only viable because `/media/:id/:filename` serves
 * byte ranges: the browser fetches the container header and the frames around
 * the seek point, not the whole video. Against a 200-only server this would
 * download the entire file to grab one frame.
 *
 * `crossOrigin` is left unset deliberately — the media route is same-origin, and
 * a canvas tainted by a cross-origin frame throws on `toBlob` rather than
 * returning anything.
 */
export declare function extractVideoInfoFromUrl(url: string): Promise<VideoInfo>;
//# sourceMappingURL=video-metadata.d.ts.map
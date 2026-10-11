import sharp from 'sharp';

/**
 * Removing EXIF, XMP, IPTC and text chunks from an uploaded image. Server-only:
 * imports Sharp.
 *
 * A phone photo carries the GPS position it was taken at, the device and often
 * the owner's name. Derivatives never do (Sharp drops metadata on output), but
 * the original is what `/media/:id/:filename` serves, so without this a
 * published photo publishes where it was taken.
 *
 * Only an image that actually carries metadata is touched. Its pixels are
 * re-encoded in the same format, which is the one way libvips writes a file
 * without the blocks; a clean image keeps its bytes, so the re-encode costs
 * nothing for the screenshots and exports that make up most uploads.
 */

/** Matches the upload path's guard: a decompression bomb must not reach libvips. */
const MAX_INPUT_PIXELS = 100_000_000;

/** Encoder quality for lossy formats. High, because the result replaces the original. */
export const DEFAULT_STRIP_QUALITY = 90;

export interface StripMetadataConfig {
	/** Quality, 1-100, for re-encoding a lossy format (JPEG, WebP, AVIF). Default 90. */
	quality: number;
}

/** Normalise the `upload.stripImageMetadata` option, or null when off. */
export function resolveStripMetadataConfig(
	option: boolean | { quality?: number } | null | undefined
): StripMetadataConfig | null {
	if (!option) return null;
	const quality = option === true ? undefined : option.quality;
	return {
		quality:
			typeof quality === 'number' && quality >= 1 && quality <= 100
				? Math.round(quality)
				: DEFAULT_STRIP_QUALITY
	};
}

/**
 * An upload refused because its metadata could not be removed. The caller's
 * file is the problem, so routes answer it as a client error, not a 500.
 */
export class ImageMetadataError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ImageMetadataError';
	}
}

export type StripMetadataResult =
	| { status: 'clean'; buffer: Buffer }
	| { status: 'stripped'; buffer: Buffer; removed: string[] }
	| { status: 'unsupported'; buffer: Buffer };

/**
 * Formats that cannot hold camera metadata, or that this module does not
 * rewrite. SVG is markup, not a camera file, and Sharp cannot write it back.
 */
const PASS_THROUGH_FORMATS = new Set(['svg']);

/**
 * Return `buffer` without its metadata blocks.
 *
 * `clean`: nothing to remove, the same buffer comes back. `stripped`: a
 * re-encoded copy, with the EXIF orientation applied to the pixels first so a
 * portrait photo does not turn sideways once the tag is gone; the ICC profile
 * is kept so colours do not shift. `unsupported`: the image carries metadata
 * but cannot be rewritten here (a HEIC photo: the prebuilt libvips decodes no
 * HEVC). The caller decides what that means; the upload path refuses the file
 * rather than store the GPS position it was asked to remove.
 *
 * Throws when Sharp cannot read the buffer at all.
 */
export async function stripImageMetadata(
	buffer: Buffer,
	config: StripMetadataConfig
): Promise<StripMetadataResult> {
	const meta = await sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS }).metadata();
	if (meta.format && PASS_THROUGH_FORMATS.has(meta.format)) return { status: 'clean', buffer };

	const removed: string[] = [];
	if (meta.exif) removed.push('exif');
	if (meta.xmp) removed.push('xmp');
	if (meta.iptc) removed.push('iptc');
	if (meta.comments?.length) removed.push('comments');
	if (removed.length === 0) return { status: 'clean', buffer };

	const animated = (meta.pages ?? 1) > 1;
	let pipeline = sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS, animated }).keepIccProfile();
	// libvips refuses to rotate a multi-frame image; an animation carrying an
	// orientation tag is not something a camera produces.
	if (!animated && meta.orientation && meta.orientation !== 1) pipeline = pipeline.autoOrient();

	const quality = config.quality;
	switch (meta.format) {
		case 'jpeg':
			pipeline = pipeline.jpeg({ quality });
			break;
		case 'png':
			// A palette PNG stays a palette PNG instead of growing into truecolour.
			pipeline = pipeline.png({ palette: Boolean(meta.isPalette) });
			break;
		case 'webp':
			pipeline = pipeline.webp({ quality });
			break;
		case 'gif':
			pipeline = pipeline.gif();
			break;
		case 'tiff':
			pipeline = pipeline.tiff();
			break;
		case 'heif':
			// AVIF is HEIF with AV1 inside, which libvips can write. HEVC (a
			// phone's HEIC) it can neither decode nor encode.
			if (meta.compression !== 'av1') return { status: 'unsupported', buffer };
			pipeline = pipeline.avif({ quality });
			break;
		default:
			return { status: 'unsupported', buffer };
	}

	try {
		return { status: 'stripped', buffer: await pipeline.toBuffer(), removed };
	} catch {
		return { status: 'unsupported', buffer };
	}
}

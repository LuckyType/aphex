import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { AssetService } from '../src/lib/services/asset-service';
import {
	ImageMetadataError,
	resolveStripMetadataConfig,
	stripImageMetadata
} from '../src/lib/images/strip-metadata';
import type { StorageAdapter, UploadFileData } from '../src/lib/storage/interfaces/storage';
import type { DatabaseAdapter } from '../src/lib/db/interfaces/index';
import type { Asset } from '../src/lib/types/index';

const config = { quality: 90 };

/** A 60x30 JPEG as a phone writes it: GPS, device, and "rotate 90 degrees to display". */
async function phonePhoto(): Promise<Buffer> {
	return sharp({ create: { width: 60, height: 30, channels: 3, background: '#c05030' } })
		.jpeg()
		.withMetadata({ orientation: 6 })
		.withExif({
			IFD0: { Make: 'PhoneMaker', Model: 'Phone 15', Artist: 'Jane Doe' },
			IFD3: { GPSLatitudeRef: 'N', GPSLatitude: '52/1 31/1 0/1' }
		})
		.withXmp('<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF/></x:xmpmeta>')
		.toBuffer();
}

function exifText(buffer: Buffer): string {
	return buffer.toString('latin1');
}

describe('stripImageMetadata', () => {
	it('removes EXIF and XMP from a JPEG and turns its pixels upright', async () => {
		const photo = await phonePhoto();
		const before = await sharp(photo).metadata();
		expect(before.exif).toBeDefined();
		expect(before.orientation).toBe(6);
		expect(exifText(photo)).toContain('PhoneMaker');

		const result = await stripImageMetadata(photo, config);
		expect(result.status).toBe('stripped');
		if (result.status !== 'stripped') return;
		expect(result.removed).toEqual(['exif', 'xmp']);

		const after = await sharp(result.buffer).metadata();
		expect(after.format).toBe('jpeg');
		expect(after.exif).toBeUndefined();
		expect(after.xmp).toBeUndefined();
		expect(after.orientation).toBeUndefined();
		// Rotated into the pixels, so the tag going away does not turn it sideways.
		expect([after.width, after.height]).toEqual([30, 60]);
		expect(exifText(result.buffer)).not.toContain('PhoneMaker');
		expect(exifText(result.buffer)).not.toContain('Jane Doe');
	});

	it('keeps the ICC profile so colours do not shift', async () => {
		const photo = await sharp(await phonePhoto())
			.withIccProfile('p3')
			.withExif({ IFD0: { Make: 'PhoneMaker' } })
			.jpeg()
			.toBuffer();
		expect((await sharp(photo).metadata()).icc).toBeDefined();

		const result = await stripImageMetadata(photo, config);
		expect(result.status).toBe('stripped');
		const after = await sharp(result.buffer).metadata();
		expect(after.icc).toBeDefined();
		expect(after.exif).toBeUndefined();
	});

	it('returns a clean image byte for byte', async () => {
		const png = await sharp({ create: { width: 8, height: 8, channels: 4, background: '#000' } })
			.png()
			.toBuffer();
		const result = await stripImageMetadata(png, config);
		expect(result.status).toBe('clean');
		expect(result.buffer).toBe(png);
	});

	it('removes EXIF from a PNG and keeps it a palette PNG', async () => {
		const png = await sharp({ create: { width: 8, height: 8, channels: 3, background: '#09f' } })
			.png({ palette: true })
			.withMetadata()
			.withExif({ IFD0: { Artist: 'Jane Doe' } })
			.toBuffer();
		expect((await sharp(png).metadata()).exif).toBeDefined();

		const result = await stripImageMetadata(png, config);
		expect(result.status).toBe('stripped');
		const after = await sharp(result.buffer).metadata();
		expect(after.format).toBe('png');
		expect(after.exif).toBeUndefined();
		expect(after.isPalette).toBe(true);
		expect(exifText(result.buffer)).not.toContain('Jane Doe');
	});

	it('removes EXIF from WebP and AVIF in their own format', async () => {
		for (const format of ['webp', 'avif'] as const) {
			const image = await sharp({
				create: { width: 16, height: 16, channels: 3, background: '#0a0' }
			})
				[format]()
				.withExif({ IFD0: { Artist: 'Jane Doe' } })
				.toBuffer();
			expect((await sharp(image).metadata()).exif, format).toBeDefined();

			const result = await stripImageMetadata(image, config);
			expect(result.status, format).toBe('stripped');
			const after = await sharp(result.buffer).metadata();
			expect(after.exif, format).toBeUndefined();
			expect(after.format, format).toBe(format === 'avif' ? 'heif' : 'webp');
		}
	});
});

describe('resolveStripMetadataConfig', () => {
	it('is off unless asked for, and bounds the quality', () => {
		expect(resolveStripMetadataConfig(undefined)).toBeNull();
		expect(resolveStripMetadataConfig(false)).toBeNull();
		expect(resolveStripMetadataConfig(true)).toEqual({ quality: 90 });
		expect(resolveStripMetadataConfig({ quality: 75.4 })).toEqual({ quality: 75 });
		expect(resolveStripMetadataConfig({ quality: 0 })).toEqual({ quality: 90 });
	});
});

/** Storage and database kept in memory, enough for the two upload paths. */
function harness() {
	const objects = new Map<string, Buffer>();
	const rows = new Map<string, Asset>();
	const storage: StorageAdapter = {
		name: 'memory',
		async store(data: UploadFileData) {
			const key = data.key ?? data.filename;
			objects.set(key, data.buffer);
			return { key, path: key, url: `/${key}`, size: data.buffer.length } as never;
		},
		async delete(path) {
			return objects.delete(path);
		},
		async exists(path) {
			return objects.has(path);
		},
		getUrl: (path) => `/${path}`,
		async getObject(path) {
			const object = objects.get(path);
			if (!object) throw new Error('missing');
			return object;
		},
		async getObjectRange(path, start, end) {
			const object = objects.get(path)!.subarray(start, end + 1);
			return new Response(object).body!;
		},
		async getObjectMetadata(path) {
			const object = objects.get(path);
			if (!object) throw new Error('missing');
			return { size: object.length } as never;
		},
		async copyObject(from, to) {
			objects.set(to, objects.get(from)!);
			return true;
		},
		resolvePath: (key) => key,
		async getStorageInfo() {
			return { totalSize: 0, totalFiles: 0 } as never;
		},
		async isHealthy() {
			return true;
		}
	};
	const database = {
		async createAsset(data: Partial<Asset>) {
			const row = { ...data } as Asset;
			rows.set(row.id, row);
			return row;
		},
		async findAssetById(_org: string, id: string) {
			return rows.get(id) ?? null;
		},
		async updateAsset(_org: string, id: string, patch: Partial<Asset>) {
			const row = { ...rows.get(id)!, ...patch } as Asset;
			rows.set(id, row);
			return row;
		},
		async deleteAsset(_org: string, id: string) {
			return rows.delete(id);
		}
	} as unknown as DatabaseAdapter;
	return { objects, rows, storage, database };
}

describe('AssetService with upload.stripImageMetadata', () => {
	it('stores the photo without its metadata and measures it upright', async () => {
		const { objects, storage, database } = harness();
		const service = new AssetService(storage, database, null, undefined, config);
		const photo = await phonePhoto();

		const asset = await service.uploadAsset('org', {
			buffer: photo,
			originalFilename: 'IMG_0001.jpg',
			mimeType: 'image/jpeg',
			size: photo.length
		});

		const stored = objects.get(asset.path)!;
		expect((await sharp(stored).metadata()).exif).toBeUndefined();
		expect(exifText(stored)).not.toContain('PhoneMaker');
		expect(asset.size).toBe(stored.length);
		expect([asset.width, asset.height]).toEqual([30, 60]);
		expect(asset.metadata?.metadataRemoved).toEqual(['exif', 'xmp']);
	});

	it('leaves the bytes alone when the option is off', async () => {
		const { objects, storage, database } = harness();
		const service = new AssetService(storage, database);
		const photo = await phonePhoto();

		const asset = await service.uploadAsset('org', {
			buffer: photo,
			originalFilename: 'IMG_0001.jpg',
			mimeType: 'image/jpeg',
			size: photo.length
		});

		expect(objects.get(asset.path)).toBe(photo);
		expect(asset.metadata?.metadataRemoved).toBeUndefined();
	});

	it('refuses an image it cannot read instead of storing it as it came', async () => {
		const { objects, storage, database } = harness();
		const service = new AssetService(storage, database, null, undefined, config);
		// JPEG magic bytes pass the type check; nothing after them decodes.
		const broken = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(64, 7)]);

		await expect(
			service.uploadAsset('org', {
				buffer: broken,
				originalFilename: 'broken.jpg',
				mimeType: 'image/jpeg',
				size: broken.length
			})
		).rejects.toBeInstanceOf(ImageMetadataError);
		expect(objects.size).toBe(0);
	});

	it('rewrites a direct upload in place', async () => {
		const { objects, rows, storage, database } = harness();
		const service = new AssetService(storage, database, null, undefined, config);
		const photo = await phonePhoto();
		objects.set('tmp/upload', photo);

		const asset = await service.finalizeDirectUpload(
			'org',
			{
				assetId: 'a1',
				key: 'tmp/upload',
				finalKey: 'a1/IMG_0001.jpg',
				originalFilename: 'IMG_0001.jpg',
				mimeType: 'image/jpeg'
			},
			{ maxBytes: 10 * 1024 * 1024 }
		);

		const stored = objects.get('a1/IMG_0001.jpg')!;
		expect((await sharp(stored).metadata()).exif).toBeUndefined();
		expect(exifText(stored)).not.toContain('PhoneMaker');
		expect(asset.size).toBe(stored.length);
		expect([asset.width, asset.height]).toEqual([30, 60]);
		expect(rows.get('a1')?.metadata?.metadataRemoved).toEqual(['exif', 'xmp']);
	});
});

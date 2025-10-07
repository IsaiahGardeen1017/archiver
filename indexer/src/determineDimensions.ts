import sharp from 'sharp';
import { createFile, MP4BoxBuffer } from 'mp4box';
import { ChildElementsValue, Decoder, EBMLElementDetail, MasterElement } from 'ts-ebml';

export type FileType = 'mp4' | 'jpg' | 'jpeg' | 'gif' | 'webm' | 'png' | 'webp';

export async function determineFileDimensions(bytes: Uint8Array, fileType: FileType): Promise<{ width: number; height: number }> {
	switch (fileType) {
		case 'png':
		case 'jpg':
		case 'jpeg':
		case 'gif': {
			const image = await sharp(bytes);
			const metadata = await image.metadata();
			const { width, height } = metadata;
			return { width, height };
		}
		case 'webm':
			return getDimensionsFromVideoWebM(bytes);
		case 'webp': {
			const dims = parseWebPDimensions(bytes);
			if (dims) {
				return dims;
			}
			return { width: 0, height: 0 };
		}
		case 'mp4': {
			const dims = await getDimensionsFromVideoMP4(bytes);
			if (dims) {
				return dims;
			}
			return { width: 0, height: 0 };
		}
		default:
			console.log('Unrecognized file type for dimension parsing');
			return { width: 0, height: 0 };
	}
}

async function getDimensionsFromVideoMP4(bytes: Uint8Array): Promise<{ width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const mp4boxfile = createFile();

		mp4boxfile.onError = (e) => {
			reject(new Error('mp4box error: ' + e));
		};

		mp4boxfile.onReady = (info) => {
			// `info.tracks` is an array of track metadata. Find the video track.
			const videoTrack = info.tracks.find((t) => t.video != null);
			if (!videoTrack) {
				reject(new Error('No video track found'));
				return;
			}
			// mp4box gives width & height in the track metadata
			const width = videoTrack.video?.width ?? 0;
			const height = videoTrack.video?.height ?? 0;
			resolve({ width, height });
		};

		// Convert the Uint8Array to ArrayBuffer and set fileStart metadata
		const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
		(ab as MP4BoxBuffer).fileStart = 0;

		mp4boxfile.appendBuffer(ab as MP4BoxBuffer);
		mp4boxfile.flush();
	});
}

function getDimensionsFromVideoWebM(bytes: Uint8Array): { width: number; height: number } {
	const decoder = new Decoder();
	const arrBuff: ArrayBuffer = bytes.buffer as ArrayBuffer;
	const elements = decoder.decode(arrBuff);

	let width: number | undefined;
	let height: number | undefined;

	let inVideoTrack = false;

	for (const el of elements) {
		const elValidk = (el as ChildElementsValue).value;
		if (typeof elValidk !== 'object') {
			const elVal = typeof elValidk === 'number' ? elValidk : parseInt(elValidk);
			if (el.type === 'm' && el.name === 'TrackEntry') {
				inVideoTrack = false; // reset flag for each track
			}

			if (el.name === 'TrackType' && elVal === 1) {
				// TrackType 1 = video
				inVideoTrack = true;
			}

			if (inVideoTrack && el.name === 'PixelWidth') {
				width = elVal;
			}

			if (inVideoTrack && el.name === 'PixelHeight') {
				height = elVal;
			}

			if (width !== undefined && height !== undefined) {
				return { width, height };
			}
		}
	}

	return { width: 0, height: 0 };
}

/**
 * Parses WebP header (RIFF container) to extract image dimensions.
 * This is a simplified parser and might not handle all WebP variations (e.g., animated, extended).
 * See WebP specification: https://developers.google.com/speed/webp/docs/riff_container
 */
function parseWebPDimensions(bytes: Uint8Array): { width: number; height: number } | null {
	// WebP files are RIFF containers.
	// "RIFF" (0x52 0x49 0x46 0x46) at bytes 0-3
	// File size (4 bytes, little-endian) at bytes 4-7
	// "WEBP" (0x57 0x45 0x42 0x50) at bytes 8-11
	// "VP8 " (0x56 0x50 0x38 0x20) or "VP8L" or "VP8X" at bytes 12-15 (chunk type)
	// Chunk size (4 bytes, little-endian) at bytes 16-19

	if (
		!(
			bytes[0] === 0x52 &&
			bytes[1] === 0x49 &&
			bytes[2] === 0x46 &&
			bytes[3] === 0x46
		) || // "RIFF"
		!(
			bytes[8] === 0x57 &&
			bytes[9] === 0x45 &&
			bytes[10] === 0x42 &&
			bytes[11] === 0x50
		) // "WEBP"
	) {
		console.error('Invalid WebP (RIFF/WEBP) signature.');
		return null;
	}

	const chunkType = new TextDecoder().decode(bytes.slice(12, 16));

	if (chunkType === 'VP8 ') {
		// Lossy WebP (VP8)
		// Frame header starts at byte 20.
		// Width and height are at specific bit offsets within the frame header.
		// Simplified: Look for signature, then width/height.
		// Full parser would check for more complex bitstream.

		// The first 3 bytes after the chunk data (which starts at byte 20) are start code
		// Bytes 23-24 contain width and height combined in bits.
		// Width is 14 bits, height is 14 bits.

		// A bit more precise: the 16-bit width and height are little-endian.
		// `bytes[26]` and `bytes[27]` for width (2 bytes)
		// `bytes[28]` and `bytes[29]` for height (2 bytes)
		const dataView = new DataView(bytes.buffer, bytes.byteOffset + 26, 4); // 4 bytes for width and height
		const width = dataView.getUint16(0, true) & 0x3FFF; // Mask to 14 bits
		const height = dataView.getUint16(2, true) & 0x3FFF; // Mask to 14 bits

		return { width, height };
	} else if (chunkType === 'VP8L') {
		// Lossless WebP (VP8L)
		// The width and height are stored at byte 21, as 14 bits each.
		// Byte 20: Simple Header (0x2F)
		// Bytes 21-24: 14 bits for width, 14 bits for height.
		// (Byte 21)       (Byte 22)       (Byte 23)       (Byte 24)
		// 76543210 76543210 76543210 76543210
		// LLLLLLLL LLLLLLLL HHHHHHHH HHHHHHHH
		// This is more complex bit-level parsing.

		// Simplified approach (might not be perfectly accurate for all VP8L):
		// Width is at bytes 21 & 22 (low 8, high 6 bits), height at 23 & 24 (low 8, high 6 bits).
		const b21 = bytes[21];
		const b22 = bytes[22];
		const b23 = bytes[23];
		const b24 = bytes[24];

		const width = ((b22 & 0x3F) << 8) | b21;
		const height = ((b24 & 0x3F) << 8) | b23;

		return { width, height };
	} else if (chunkType === 'VP8X') {
		// Extended WebP (VP8X)
		// Flags (4 bytes) at byte 20
		// Width (3 bytes) at byte 24, height (3 bytes) at byte 27.
		// (Actual width = 1 + decoded_width, actual height = 1 + decoded_height)
		const dataView = new DataView(bytes.buffer, bytes.byteOffset + 24, 6); // 3 bytes for width, 3 for height

		const width = 1 + (dataView.getUint8(0) | (dataView.getUint8(1) << 8) | (dataView.getUint8(2) << 16));
		const height = 1 + (dataView.getUint8(3) | (dataView.getUint8(4) << 8) | (dataView.getUint8(5) << 16));

		return { width, height };
	}

	console.error(`Unsupported WebP chunk type: ${chunkType}`);
	return null;
}

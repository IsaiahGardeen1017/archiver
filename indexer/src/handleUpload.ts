import { config } from '../config.ts';
import { determineFileDimensions, FileType } from './determineDimensions.ts';
import { Entry, insertEntry, OrientationType } from './SQLite/SQLiteFuncs.ts';

const ffprobePath = './ffprobe.exe';

export async function newEntryUplaod(
	file: File,
	password: string,
	description?: string,
	source?: string,
	specSource?: string,
	tags?: string[],
): Promise<string> {
	const data: Uint8Array<ArrayBuffer> = await file.bytes();

	const fileName = file.name;
	const extension = fileName.includes('.') ? fileName.split('.').pop() : undefined;

	const { width, height } = await determineFileDimensions(data, extension as FileType);

	const hash = await hashBytesSHA256(data);

	let orientation: OrientationType = 'Unknown';
	if (width > height) {
		orientation = 'Landscape';
	} else if (height > width) {
		orientation = 'Portrait';
	} else if (width !== 0 && width === height) {
		orientation = 'Square';
	}

	const hostname = config.rawUrl;
	const resp = await fetch(`${hostname}/file`, {
		method: 'POST',
		body: data,
		headers: {
			password: password,
		},
	});

	if (resp.status !== 201 && resp.status !== 200) {
		return '';
	}

	const guid: string = await resp.text();

	const newEntry: Entry = {
		guid,
		description,
		source,
		fileType: extension,
		tags,
		height,
		width,
		orientation,
		specSource,
		hash,
	};

	const id = insertEntry(newEntry);
	if (id) {
		return id;
	}
	throw new Error('Could not insert to db');
}

async function hashBytesSHA256(bytes: Uint8Array): Promise<string> {
	const hashBuffer = await crypto.subtle.digest('SHA-256', bytes.buffer as ArrayBuffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

import { config } from '../config.ts';
import { Entry, insertEntry } from './SQLite/SQLiteFuncs.ts';

const ffprobePath = './ffprobe.exe';

export async function newEntryUplaod(
	file: File,
	password: string,
	description?: string,
	source?: string,
	tags?: string[],
): Promise<string> {
	const data: Uint8Array<ArrayBuffer> = await file.bytes();

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

	const fileName = file.name;
	const extension = fileName.includes('.') ? fileName.split('.').pop() : undefined;

	const height = 0;
	const width = 0;

	const newEntry: Entry = {
		guid,
		description,
		source,
		fileType: extension,
		tags,
		height,
		width,
	};

	const id = insertEntry(newEntry);
	if (id) {
		return id;
	}
	throw new Error('Could not insert to db');
}

import { FILE_STORAGE_URL } from './conf.ts';
import { Entry, insertEntry } from './SQLite/SQLiteFuncs.ts';

export async function newEntryUplaod(file: File, description?: string, source?: string, tags?: string[]): Promise<string> {
	const data: Uint8Array = await file.bytes();

	const hostname = FILE_STORAGE_URL;
	const resp = await fetch(`${hostname}/file`, {
		method: 'POST',
		body: data,
	});

	if (resp.status !== 201 && resp.status !== 200) {
		return '';
	}

	const guid: string = await resp.text();

	const fileName = file.name;
	const extension = fileName.includes('.') ? fileName.split('.').pop() : undefined;

	const newEntry: Entry = {
		guid,
		description,
		source,
		fileType: extension,
		tags,
	};

	const id = insertEntry(newEntry);
	if (id) {
		return id;
	}
	throw new Error('Could not insert to db');
}

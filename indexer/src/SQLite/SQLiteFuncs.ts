import { DB, QueryParameter } from 'https://deno.land/x/sqlite/mod.ts';
import { isDataView } from 'node:util/types';

const DBPath = 'volume/sqlite.db';

let db: DB;
function dbRef(): DB {
	if (!db) {
		db = new DB(DBPath);
	}
	return db;
}

export type Entry = {
	id?: number;
	guid?: string;
	description?: string;
	source?: string;
	fileType?: string;
	tags?: string[];
	height: number;
	width: number;
};

export function initializeSQLite() {
	const db = dbRef();
	db.execute(`
        CREATE TABLE IF NOT EXISTS entry (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guid TEXT UNIQUE,
            fileType TEXT,
            description TEXT,
            source TEXT,
            height INTEGER,
            width INTEGER
        );

        CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        );

        CREATE TABLE IF NOT EXISTS entry_tags (
            entry_id INTEGER NOT NULL,
            tag_id INTEGER NOT NULL,
            PRIMARY KEY (entry_id, tag_id),
            FOREIGN KEY (entry_id) REFERENCES entry(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        );
    `);
}

export function insertTag(tag: string) {
	const db = dbRef();
	try {
		db.query('INSERT OR IGNORE INTO tags (name) VALUES (?)', [tag]);
	} catch (err) {
		console.error('insertTag error:', err);
	}
}

export function getAllTags(): string[] {
	const db = dbRef();
	const tags: string[] = [];
	for (const [name] of db.query('SELECT name FROM tags')) {
		tags.push(name as string);
	}
	return tags;
}

export function deleteTag(tag: string) {
	const db = dbRef();
	db.query('DELETE FROM tags WHERE name = ?', [tag]);
}

export function insertEntry(entry: Entry): string {
	const db = dbRef();
	let id;

	db.transaction(() => {
		db.query(
			`INSERT INTO entry (guid, fileType, description, source)
             VALUES (?, ?, ?, ?)`,
			[entry.guid, entry.fileType, entry.description, entry.source],
		);

		id = db.lastInsertRowId;

		if (entry.tags) {
			for (const tag of entry.tags) {
				db.query('INSERT OR IGNORE INTO tags (name) VALUES (?)', [tag]);

				const [[tagId]] = db.query<[number]>('SELECT id FROM tags WHERE name = ?', [tag]);

				db.query(
					'INSERT INTO entry_tags (entry_id, tag_id) VALUES (?, ?)',
					[id, tagId],
				);
			}
		}
	});

	return id || '';
}

type EntryRow = [number, string, string, string, string, number, number];

export function getEntry(id: string): Entry {
	const db = dbRef();
	const row = [...db.query<EntryRow>('SELECT id, guid, fileType, description, source FROM entry WHERE id = ?', [
		id,
	])][0];
	if (!row) throw new Error('Entry not found');

	const entry = rowToEntry(row);

	const tags = [...db.query(
		`SELECT t.name FROM tags t
         JOIN entry_tags et ON et.tag_id = t.id
         WHERE et.entry_id = ?`,
		[entry.id],
	)].map(([tagName]) => tagName as string);

	entry.tags = tags;
	return entry;
}

export function getAllEntry(): Entry[] {
	const db = dbRef();
	const entries: Entry[] = [];

	for (
		const row of db.query<EntryRow>(
			'SELECT id, guid, fileType, description, source FROM entry',
		)
	) {
		const newEntry = rowToEntry(row);
		const tags = [...db.query(
			`SELECT t.name FROM tags t
             JOIN entry_tags et ON et.tag_id = t.id
             WHERE et.entry_id = ?`,
			[newEntry.id as QueryParameter],
		)].map(([tagName]) => tagName as string);
		newEntry.tags = tags;
		entries.push(newEntry);
	}

	return entries;
}

export function deleteEntry(id: string) {
	const db = dbRef();
	db.query('DELETE FROM entry WHERE id = ?', [id]);
}

export function addTagToEntry(entryId: string, tag: string) {
	const db = dbRef();
	db.transaction(() => {
		const tagResult = [
			...db.query<[number]>('SELECT id FROM tags WHERE name = ?', [tag]),
		];
		if (tagResult.length === 0) {
			throw new Error(`"${tag}" is not a defined tag`);
		}
		const tagId = tagResult[0][0];
		const entryResult = [
			...db.query<[number]>(
				'SELECT id FROM entry WHERE id = ?',
				[entryId],
			),
		];
		if (entryResult.length === 0) {
			throw new Error(`id ${entryId} does not exist`);
		}
		const actualEntryId = entryResult[0][0];
		db.query(
			'INSERT OR IGNORE INTO entry_tags (entry_id, tag_id) VALUES (?, ?)',
			[actualEntryId, tagId],
		);
	});
}

function rowToEntry(row: EntryRow): Entry {
	const id = row[0] || undefined;
	const guid = row[1] || undefined;
	const fileType = row[2] || undefined;
	const description = row[3] || undefined;
	const source = row[4] || undefined;
	const height = row[5];
	const width = row[6];
	return {
		id,
		guid,
		fileType,
		description,
		source,
		height,
		width,
	};
}

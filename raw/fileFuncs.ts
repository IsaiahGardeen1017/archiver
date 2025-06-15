export async function getListOfFileInDir(dirname: string, startStrMatch?: string): Promise<string[]> {
	const files: string[] = [];
	const dirEntries = await Deno.readDirSync(dirname);
	dirEntries.forEach((fi) => {
		if (fi.isFile && !fi.isDirectory && !fi.isSymlink) {
			const fname = fi.name;
			if (startStrMatch) {
				if (fname.length >= startStrMatch.length) {
					if (fname.substring(0, startStrMatch.length) === startStrMatch) {
						files.push(fname);
					}
				}
			} else {
				files.push(fname);
			}
		}
	});
	return files;
}

export async function getFile(filepath: string): Promise<Uint8Array<ArrayBuffer> | undefined> {
	try {
		const file = await Deno.readFileSync(filepath);
		return file;
	} catch (err) {
		return undefined;
	}
}

export async function saveFile(dirname: string, data: Uint8Array<ArrayBuffer>): Promise<string> {
	const guid = crypto.randomUUID();
	try {
		await Deno.writeFileSync(`${dirname}/${guid}`, data);
	} catch (err) {
		return '';
	}
	return guid;
}

export async function deleteFile(filepath: string): Promise<string> {
	try {
		const f = await Deno.lstatSync(filepath);
	} catch (err) {
		return `${filepath.split('/')[1]} does not exist`;
	}

	try {
		await Deno.removeSync(filepath);
	} catch (err) {
		return `Could not remove ${filepath.split('/')[1]} for some reason`;
	}

	return '';
}

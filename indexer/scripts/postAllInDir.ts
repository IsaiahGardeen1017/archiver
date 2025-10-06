const dir = Deno.args[0];

console.log(dir);

async function postAllFileInDir(dirPath: string) {
	const dir = Deno.readDirSync(dirPath);
	const files: File[] = [];
	for await (const file of dir) {
		await postFile(dirPath, file);
	}
	return files;
}

postAllFileInDir(dir);

async function postFile(dirName: string, file: Deno.DirEntry) {
	console.log('POSTING: ', file.name);
	const filePath = `${dirName}/${file.name}`;
	const fileBytes = await Deno.readFileSync(filePath);
	const fileBlob = new Blob([fileBytes], { type: getMimeType(file.name.split('.')[1]) });
	const formData = new FormData();

	formData.append('file', fileBlob, file.name);
	formData.append('desc', 'undescribed');
	formData.append('source', 'upload');
	formData.append('password', 'kitfisto');

	const resp = await fetch('http://localhost:3000/upload', {
		method: 'POST',
		body: formData,
	});
	console.log(await resp);
}

/*
[
  "99578360-bed5-4cbe-abe6-a70a93a44533",
  "6b919854-01b7-439f-b215-6d3e12d83046"
]
*/

function getMimeType(extension: string): string {
	const normalizedExtension = extension.toLowerCase();

	switch (normalizedExtension) {
		case 'jpg':
		case 'jpeg':
			return 'image/jpeg';
		case 'png':
			return 'image/png';
		case 'gif':
			return 'image/gif';
		case 'webm':
			return 'video/webm';
		case 'webp':
			return 'image/webp';
		case 'mov':
			return 'video/quicktime'; // Apple QuickTime
		case 'mp4':
			return 'video/mp4';
		default:
			return 'application/octet-stream'; // Generic binary data
	}
}

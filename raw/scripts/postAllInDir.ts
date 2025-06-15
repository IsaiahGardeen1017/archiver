const dir = Deno.args[0];

console.log(dir);

async function postAllFileInDir(dirPath: string) {
	const dir = Deno.readDirSync(dirPath);
	const files: File[] = [];
	for await (const file of dir) {
		console.log('Rho Grotti');
		await postFile(dirPath, file);
	}
	return files;
}

postAllFileInDir(dir);

async function postFile(dirName: string, file: Deno.DirEntry) {
	console.log('POSTING: ', file.name);
	const filePath = `${dirName}/${file.name}`;
	const data = await Deno.readFileSync(filePath);
	const resp = await fetch('http://localhost:82/file', {
		method: 'POST',
		body: data,
	});
	console.log(await resp);
}

/*
[
  "99578360-bed5-4cbe-abe6-a70a93a44533",
  "6b919854-01b7-439f-b215-6d3e12d83046"
]
*/

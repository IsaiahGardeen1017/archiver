import { determineFileDimensions, FileType } from './determineDimensions.ts';

const files = await Deno.readDirSync('./scripts/TEMP/');
files.forEach(async (file) => {
	if (file.isFile) {
		const bytes = Deno.readFileSync(`./scripts/TEMP/${file.name}`);
		const ext = file.name.split('.').pop() as FileType;
		const dims = await determineFileDimensions(bytes, ext);
		console.log('File: ', file.name);
		console.log(dims);
	}
});

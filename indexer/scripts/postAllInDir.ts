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
	formData.append('desc', names[Math.floor(Math.random() * names.length)]);
	formData.append('source', 'script');
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

const names = [
	'Adeline',
	'Alana',
	'Alice',
	'Alicia',
	'Alison',
	'Andrea',
	'Anne',
	'Antonia',
	'April',
	'Ariana',
	'Ava',
	'Bella',
	'Bethany',
	'Bridget',
	'Brooke',
	'Caitlyn',
	'Cara',
	'Caroline',
	'Cecilia',
	'Chelsea',
	'Chloe',
	'Christina',
	'Christine',
	'Claire',
	'Clara',
	'Coral',
	'Daisy',
	'Delilah',
	'Denise',
	'Eleanor',
	'Elizabeth',
	'Ella',
	'Emily',
	'Emma',
	'Erin',
	'Estelle',
	'Esther',
	'Eve',
	'Evelyn',
	'Faith',
	'Fiona',
	'Flora',
	'Florence',
	'Frances',
	'Freya',
	'Gemma',
	'Genevieve',
	'Georgina',
	'Grace',
	'Hannah',
	'Helen',
	'Helena',
	'Holly',
	'Hope',
	'Ida',
	'Ingrid',
	'Iris',
	'Isabella',
	'Isabelle',
	'Ivy',
	'Jade',
	'Jane',
	'Janet',
	'Jean',
	'Jemima',
	'Jennifer',
	'Jessica',
	'Jill',
	'Joan',
	'Joanna',
	'Josephine',
	'Joy',
	'Julia',
	'Julie',
	'Kate',
	'Katie',
	'Kelly',
	'Kerry',
	'Kim',
	'Laura',
	'Lauren',
	'Lavender',
	'Leah',
	'Leila',
	'Lena',
	'Lesley',
	'Lily',
	'Lisa',
	'Lois',
	'Lucy',
	'Lynda',
	'Marcia',
	'Margaret',
	'Maria',
	'Marianne',
	'Marie',
	'Marilyn',
	'Marion',
	'Martha',
	'Mary',
	'Matilda',
	'Maud',
	'Maureen',
	'Megan',
	'Melanie',
	'Melissa',
	'Mia',
	'Michelle',
	'Millicent',
	'Molly',
	'Monica',
	'Nancy',
	'Naomi',
	'Natalie',
	'Nell',
	'Nicola',
	'Nicole',
	'Nora',
	'Norah',
	'Olivia',
	'Paige',
	'Pamela',
	'Patricia',
	'Paula',
	'Penelope',
	'Philippa',
	'Phoebe',
	'Phyllis',
	'Pippa',
	'Polly',
	'Poppy',
	'Rachel',
	'Rebecca',
	'Rhoda',
	'Rosalie',
	'Rose',
	'Rosemary',
	'Ruby',
	'Ruth',
	'Sabrina',
	'Sally',
	'Samantha',
	'Sandra',
	'Sarah',
	'Scarlett',
	'Shannon',
];

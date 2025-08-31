const url = 'http://localhost:3000/';
const fileLocation = 'C:\\Users\\isaia\\Downloads\\DEL';

const response = await fetch(url + 'refs');

if (!response.ok) {
	console.log('failed to get refs');
}

const refs = await response.json();
refs.forEach(async (ref: any) => {
	const fileName = ref.guid + '.' + ref.fileType;
	const mediaUrl = ref.link;
	const mediaResponse = await fetch(mediaUrl);
	const mediaFile = await mediaResponse.bytes();
	Deno.writeFileSync(fileLocation + '/' + fileName, mediaFile);
});

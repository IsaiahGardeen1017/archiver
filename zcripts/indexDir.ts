const dir = 'C:\\Users\\isaia\\Downloads\\87564756424575637\\1234978456341987465ext\\12349784563419874651658487';

const dirC = await Deno.readDirSync(dir);

dirC.forEach(async (dirEntry) => {
	if (dirEntry.isFile) {
		const filePath = dir + '\\' + dirEntry.name;

		const file = await Deno.readFileSync(filePath);
		const fileName = filePath.split('/').pop() || 'untitled';

		const formData = new FormData(); // Start with an empty FormData object
		formData.append('file', new Blob([file]), fileName);
		formData.append('source', 'local');

		const response = await fetch('http://localhost:3000/upload', {
			method: 'POST',
			body: formData,
		});

		if (response.ok) {
			console.log('ok');
		} else {
			console.log('failed: ' + filePath);
		}
	}
});

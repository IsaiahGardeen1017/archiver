async function search(): Promise<string[]> {
	const resp = await fetch('http://localhost:82/file');
	const body = await resp.json() as string[];

	return body;
}

const guids = await search();

guids.forEach(async (guid) => {
	try {
		const resp = await fetch('http://localhost:82/file/' + guid, {
			headers: {
				password: 'kitfisto',
			},
		});
		if (resp.status != 200) {
			console.error(resp);
		}
		const uiarr: Uint8Array = await resp.bytes();
		Deno.writeFileSync(`./temp/raw/${guid}`, uiarr);
	} catch (err) {
		console.error(err);
	}
});

async function search(): Promise<string[]> {
	const resp = await fetch('http://localhost:82/file');
	const body = await resp.json() as string[];

	return body;
}

const guids = await search();

guids.forEach(async (guid) => {
	const resp = await fetch('http://localhost:82/file/' + guid);
	const uiarr: Uint8Array = await resp.bytes();
	Deno.writeFileSync(`./temp-2/${guid}`, uiarr);
});

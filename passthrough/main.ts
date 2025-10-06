export const FILE_STORAGE_DIR = './volume-file-dir/';

passthroughIndexed();

function passthroughIndexed() {
	Deno.serve({ port: 80 }, async (req) => {
		const refs = await (await fetch('http://localhost:3000/refs')).json() as any[];
		const randomIndex = Math.floor(Math.random() * refs.length);
		const chosenLink = refs[randomIndex].id;

		const resp = await fetch(chosenLink, {
			headers: {
				password: 'kitfisto',
			},
		});
		const uiarr = await resp.bytes();
		return new Response(uiarr, {
			status: 200,
			headers: resp.headers,
		});
	});
}

function passthroughRaw() {
	Deno.serve({ port: 80 }, async (req) => {
		const url = new URL(req.url);
		const urlParts = url.pathname.split('/');
		const newUrl = urlParts.slice(1);
		const resp = await fetch('http://localhost:82/' + newUrl, {
			headers: {
				password: 'kitfisto',
			},
		});
		const uiarr = await resp.bytes();
		return new Response(uiarr, {
			status: 200,
		});
	});
}

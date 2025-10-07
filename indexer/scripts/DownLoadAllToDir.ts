const dir = Deno.args[0];

console.log(dir);

const refs: any[] = await (await fetch('http://localhost:3000/refs')).json();

refs.forEach(async (ref) => {
	const mediaLink = ref.link;
	const respo = await fetch(mediaLink, {
		headers: {
			password: 'kitfisto',
		},
	});

	if (respo.status === 200) {
		const bytes = await respo.bytes();
		Deno.writeFileSync(`${dir}/${ref.guid}.${ref.fileType}`, bytes);
	} else {
		console.log(ref);
	}
});

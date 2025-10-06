import { Handlers, PageProps } from '$fresh/server.ts';

interface Data {
	success: boolean;
}

export const handler: Handlers<Data> = {
	async GET(req, ctx) {
		const currentUrl = new URL(req.url);
		const res = await fetch(`${currentUrl.origin}/api/rand`);

		if (!res.ok) {
			return ctx.render({ success: true });
		}
		return ctx.render({ success: false });
	},
};

export default function EntryPage({ data }: PageProps<Data>) {
	return (
		<div>
			<title>Deleted Succesfully</title>
		</div>
	);
}

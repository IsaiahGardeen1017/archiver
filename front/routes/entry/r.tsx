import { Handlers, PageProps } from '$fresh/server.ts';
import { EntryDisplayProps } from '../../components/EntryDisplay.tsx';
import { EntryReference } from '../../components/EntryList.tsx';
import { SingleImageDisplay } from './[id].tsx';

interface Data {
	reference: EntryReference;
	url: string;
}

export const handler: Handlers<Data> = {
	async GET(req, ctx) {
		const refs = await (await fetch('http://localhost:3000/refs')).json() as any[];
		const randomIndex = Math.floor(Math.random() * refs.length);
		const id = refs[randomIndex].id;

		const currentUrl = new URL(req.url);
		const res = await fetch(`${currentUrl.origin}/api/ref/${id}`);

		if (!res.ok) {
			console.error('Failed to fetch image:', res.status, res.statusText);
			return ctx.render({ reference: {}, url: currentUrl.origin });
		}

		const reference: EntryReference = await res.json();
		return ctx.render({ reference, url: currentUrl.origin });
	},
};

export default function EntryPage({ data }: PageProps<Data>) {
	const reference = data.reference; // Accessing the guid from props.params
	const url = data.url;

	const handleClick = async () => {
		console.log('deleing');
		const res = await fetch(`${url}/api/ref/${reference.id}/delete`);
		if (res.ok) {
			console.log(`${reference.id} succesfully deleted`);
		}
	};

	return (
		<div>
			<title>{reference.id}</title>
			<SingleImageDisplay
				indexr={1}
				entry={reference}
			/>

			<button
				class='bg-lime-200 m-2 text-red-900'
				onClick={handleClick}
			>
				DELETE
			</button>
		</div>
	);
}

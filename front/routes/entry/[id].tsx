import { Handlers, PageProps } from '$fresh/server.ts';
import { EntryDisplayProps } from '../../components/EntryDisplay.tsx';
import { EntryReference } from '../../components/EntryList.tsx';

interface Data {
	reference: EntryReference;
	url: string;
}

export const handler: Handlers<Data> = {
	async GET(req, ctx) {
		const { id } = ctx.params;
		const currentUrl = new URL(req.url);
		const res = await fetch(`${currentUrl.origin}/api/ref/${id}`);

		if (!res.ok) {
			console.error('Failed to fetch image:', res.status, res.statusText);
			//Here I want to redirect
			return Response.redirect(`${currentUrl.origin}/entry/r`, 302);
		}

		const reference: EntryReference = await res.json();
		return ctx.render({ reference, url: currentUrl.origin });
	},
};

export default function EntryPage({ data }: PageProps<Data>) {
	const reference = data.reference; // Accessing the guid from props.params
	const url = data.url;

	const handleClick = async () => {
		console.log('deleting');
		const res = await fetch(`${url}/api/ref/${reference.id}/delete`);
		if (res.ok) {
			console.log(`${reference.id} succesfully deleted`);
		}
	};

	const deleteButton = (
		<button
			class='bg-lime-200 m-2 text-red-900'
			onClick={handleClick}
		>
			DELETE
		</button>
	);

	return (
		<div>
			<title>{reference.id}</title>
			<SingleImageDisplay
				indexr={1}
				entry={reference}
			/>
		</div>
	);
}

export function SingleImageDisplay(props: EntryDisplayProps) {
	const fileType = props.entry.fileType;
	const description = props.entry.description ||
		`Image ${props.indexr} (${fileType})`;

	let section;
	switch (fileType) {
		case 'webm':
		case 'mp4':
			section = (
				<div>
					<video
						autoplay
						muted
						loop
						controls
						class='object-contain w-full h-full max-h-[85vh] max-w-[90vw]'
					>
						<source src={`/api/media/${props.entry.guid}.${props.entry.fileType}`} type='video/webm' />
						Your browser does not support the video tag.
					</video>
				</div>
			);
			break;
		default:
			section = (
				<div>
					<img
						key={props.indexr}
						src={`/api/media/${props.entry.guid}.${props.entry.fileType}`}
						alt={description}
						loading='lazy'
						class='object-contain w-full h-full max-h-[85vh] max-w-[90vw]'
					/>
				</div>
			);
			break;
	}
	return (
		<div>
			<div class='flex justify-between w-full mt-4'>
				<a
					href={`/entry/${props.entry.id ? props.entry.id - 1 : 'r'}`}
					class='text-blue-500 hover:text-blue-700'
				>
					Previous
				</a>
				<a
					href={`/entry/${props.entry.id ? props.entry.id + 1 : 'r'}`}
					class='text-blue-500 hover:text-blue-700'
				>
					Next
				</a>
			</div>
			{section}
		</div>
	);
}

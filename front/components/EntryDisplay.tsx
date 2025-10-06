import { EntryReference } from './EntryList.tsx';

export type EntryDisplayProps = {
	entry: EntryReference;
	indexr: number;
};

export function EntryDisplay(props: EntryDisplayProps) {
	const fileType = props.entry.fileType;
	const description = props.entry.description ||
		`Image ${props.indexr} (${fileType})`;

	switch (fileType) {
		case 'webm':
		case 'mp4':
			return (
				<div>
					<video
						autoplay
						muted
						loop
						controls
						class='w-96 inline-block border-4 border-amber-500'
					>
						<source src={`/api/media/${props.entry.guid}.${props.entry.fileType}`} type='video/webm' />
						Your browser does not support the video tag.
					</video>
					<a href={`/entry/${props.entry.id}`}>
						{props.entry.id} - {props.entry.description}
					</a>
				</div>
			);
		default:
			return (
				<div>
					<a href={`/entry/${props.entry.id}`}>
						<img
							key={props.indexr}
							src={`/api/media/${props.entry.guid}.${props.entry.fileType}`}
							alt={description}
							loading='lazy'
							class='border-4 border-amber-500 w-96 inline-block'
						/>
					</a>
				</div>
			);
	}
}

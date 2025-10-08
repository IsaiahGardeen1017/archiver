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
				<div class='border-4 border-amber-500'>
					<video
						autoplay
						muted
						loop
						controls
						class='w-96 inline-block'
					>
						<source src={`/api/media/${props.entry.guid}.${props.entry.fileType}`} type={`video/${fileType}`} />
						Your browser does not support the video tag.
					</video>
					<a href={`/entry/${props.entry.id}`}>
						{props.entry.id} - {props.entry.description} ({props.entry.fileType})
					</a>
				</div>
			);
		default:
			return (
				<div class='border-4 border-amber-500'>
					<a href={`/entry/${props.entry.id}`}>
						<img
							key={props.indexr}
							src={`/api/media/${props.entry.guid}.${props.entry.fileType}`}
							alt={description}
							loading='lazy'
							class='w-96 inline-block'
						/>
					</a>
					{props.entry.id} - {props.entry.description} ({props.entry.fileType})
				</div>
			);
	}
}

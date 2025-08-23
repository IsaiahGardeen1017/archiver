import { EntryReference } from "./EntryList.tsx";

export type EntryDisplayProps = {
  entry: EntryReference;
  indexr: number;
};

export function EntryDisplay(props: EntryDisplayProps) {
  const fileType = props.entry.fileType;
  const description = props.entry.description ||
    `Image ${props.indexr} (${fileType})`;

  switch (fileType) {
    case "webm":
    case "mp4":
      return (
        <div>
          <video autoplay muted loop controls>
            <source src={props.entry.link} type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    default:
      return (
        <div>
          <img
            key={props.indexr}
            src={props.entry.link}
            alt={description}
            style={{ width: "100%", height: "auto", display: "block" }}
            loading="lazy"
            class="border-4 border-amber-500"
          />
        </div>
      );
  }
}

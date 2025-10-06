// components/ImageGrid.tsx
import { Fragment } from "preact";
import { EntryDisplay } from "./EntryDisplay.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";

export type ImageGridProps = {
  references: EntryReference[];
  //imageUrls: string[];
};

export type EntryReference = {
  id?: number;
  guid?: string;
  description?: string;
  source?: string;
  fileType?: string;
  tags?: string[];
  link?: string;
};

export function EntryList(props: ImageGridProps) {
  const refs = props.references;
  return (
    <div class="w-full columns-[300px] justify-center">
      {refs.map((ref, index) => (
        <div>
          <EntryDisplay
            indexr={index}
            entry={ref}
          />
        </div>
      ))}
    </div>
  );
}

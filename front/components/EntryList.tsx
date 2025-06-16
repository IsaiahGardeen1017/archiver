// components/ImageGrid.tsx
import { Fragment } from "preact";

interface ImageGridProps {
  imageUrls: string[];
}

export function EntryList(props: ImageGridProps) {
  const { imageUrls } = props;
  return (
    <div>
      {imageUrls.map((url, index) => (
        <img
          key={index}
          src={url}
          alt={`Image ${index + 1}`}
          style={{ width: "100%", height: "auto", display: "block" }}
          loading="lazy" // Good practice for many images
        />
      ))}
    </div>
  );
}

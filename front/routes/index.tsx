import { useSignal } from "@preact/signals";
import Counter from "../islands/Counter.tsx";
import { GotoUploader } from "../components/GotoUplaoder.tsx";
import { EntryList } from "../components/EntryList.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";

interface Data {
  imageUrls: string[];
}

// Server-side data fetching
export const handler: Handlers<Data> = {
  async GET(_req, ctx) {
    console.log("HANDELING");
    const apiBaseUrl = "http://localhost:8000"; // Or your deployed URL
    const res = await fetch(`${apiBaseUrl}/api/images`);

    console.log("HANDELING");
    if (!res.ok) {
      // Handle error, e.g., redirect to an error page or show a message
      console.error("Failed to fetch images:", res.status, res.statusText);
      return ctx.render({ imageUrls: [] }); // Render with empty array on error
    }

    const imageUrls: string[] = await res.json();
    return ctx.render({ imageUrls });
  },
};

export default function Home({ data }: PageProps<Data>) {
  const { imageUrls } = data;
  console.log("imageUrls");
  console.log(imageUrls);
  return (
    <div>
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <img
          class="my-6"
          src="/skeletons.jpg"
          width="500"
          height="500"
          alt="Really cool skeletons"
        />
        <h1 class="text-4xl font-bold">Welcome to my website</h1>
        <GotoUploader />
        <EntryList imageUrls={imageUrls} />
      </div>
    </div>
  );
}

import { useSignal } from "@preact/signals";
import Counter from "../islands/Counter.tsx";
import { GotoUploader } from "../components/GotoUplaoder.tsx";
import { EntryList, EntryReference } from "../components/EntryList.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";

interface Data {
  references: EntryReference[];
}

// Server-side data fetching
export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const currentUrl = new URL(req.url);
    const res = await fetch(`${currentUrl.origin}/api/refs`);

    if (!res.ok) {
      console.error("Failed to fetch images:", res.status, res.statusText);
      return ctx.render({ references: [] });
    }

    const references: EntryReference[] = await res.json();
    references.sort(() => Math.random() - 0.5);
    return ctx.render({ references });
  },
};

export default function Home({ data }: PageProps<Data>) {
  const { references } = data;
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
        <EntryList references={references} />
      </div>
    </div>
  );
}

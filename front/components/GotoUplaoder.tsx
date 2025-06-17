import { JSX } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";

export function GotoUploader() {
  return (
    <a
      href="/upload"
      className="bg-gray-600 hover:bg-gray-400 rounded m-1 p-1 border-black border-2"
    >
      Upload
    </a>
  );
}

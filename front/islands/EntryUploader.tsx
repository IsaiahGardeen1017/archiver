import { useEffect, useState } from "preact/hooks";

const [selectedFile, setSelectedFile] = useState<File | null>(null);

export default function EntryUplaoder() {
  const onSubmit = (event: Event) => {
    event.preventDefault(); // Prevent default form submission
    console.log("Form submitted!");
    if (selectedFile) {
      console.log("Selected file:", selectedFile.name, selectedFile.type);
    } else {
      console.log("No file selected.");
    }
  };

  return (
    <div>
      <h1 class="text-4xl font-bold">Add new entry</h1>
      <form onSubmit={onSubmit} className="m-1 p-1">
        <label>
          Description:{" "}
          <input
            name="desc"
            className="m-2 ps-2 bg-slate-400 focus:bg-slate-300 text-black"
          />
        </label>
        <br />
        <label>
          Source:{" "}
          <input
            name="src"
            className="m-2 ps-2 bg-slate-400 focus:bg-slate-300 text-black"
          />
        </label>

        <br />
        <input
          type="file"
          accept="image/*,video/*,image/gif" // Accept common image, video, and gif types
        />

        <br />
        <button className="bg-gray-600 hover:bg-gray-400 rounded m-1 p-1 border-black border-2">
          Submit
        </button>
      </form>
    </div>
  );
}

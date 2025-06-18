import { useRef, useState } from "preact/hooks";

export default function EntryUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const onSubmit = (event: Event) => {
    event.preventDefault(); // Prevent default form submission
    console.log("Form submitted!");
    if (selectedFile) {
      console.log("Selected file:", selectedFile.name, selectedFile.type);
      // In a real application, you would typically send this file to your backend
      // using FormData and a fetch request.
      // Example:
      // const formData = new FormData(event.target as HTMLFormElement);
      // formData.append("file", selectedFile);
      // fetch("/api/upload", {
      //   method: "POST",
      //   body: formData,
      // });
    } else {
      console.log("No file selected.");
    }

    const form = event.target as HTMLFormElement;
    const description = (form.elements.namedItem("desc") as HTMLInputElement)
      .value;
    const source = (form.elements.namedItem("src") as HTMLInputElement).value;

    console.log("Description:", description);
    console.log("Source:", source);
  };

  const handleFileChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      setSelectedFile(target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      setSelectedFile(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
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

        {/* File Upload Section */}
        <div
          className={`mt-4 p-4 border-2 border-dashed rounded-md text-center cursor-pointer ${
            isDragOver
              ? "border-blue-500 bg-blue-100"
              : "border-gray-400 bg-gray-100"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleButtonClick}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden" // Hide the default file input
            accept="image/*,video/*,image/gif" // Accept common image, video, and gif types
          />
          {selectedFile
            ? <p>Selected file: {selectedFile.name}</p>
            : <p>Drag and drop your file here, or click to select a file</p>}
          <p className="text-sm text-gray-500">
            (Images, Videos, Gifs are supported)
          </p>
        </div>

        <button className="bg-gray-600 hover:bg-gray-400 rounded m-1 p-1 border-black border-2">
          Submit
        </button>
      </form>
    </div>
  );
}

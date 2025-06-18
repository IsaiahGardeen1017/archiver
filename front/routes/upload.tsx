import EntryUplaoder from "../islands/EntryUploader.tsx";

export default function Uploader() {
  return (
    <div>
      <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
        <img
          class="my-6"
          src="/welcome/w1.webp"
          width="500"
          height="500"
          alt="Really cool skeletons"
        />
      </div>
      <div class="flex justify-center items-center">
        <EntryUplaoder />
      </div>
    </div>
  );
}

import { Head } from "$fresh/runtime.ts";

export default function Error404() {
  return (
    <div>
      <Head>
        <title>404</title>
      </Head>
      <div>
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <img
            class="my-6"
            src="/notfound.jpg"
            width="500"
            height="500"
            alt="Really cool skeletons"
          />
          <h1 class="text-4xl font-bold">404 - Page not found</h1>
          <a
            href="/"
            className="bg-gray-600 hover:bg-gray-400 rounded m-1 p-1 border-black border-2"
          >
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

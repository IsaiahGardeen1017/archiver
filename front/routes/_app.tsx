import { type PageProps } from "$fresh/server.ts";

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>front</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body className="bg-slate-700 text-emerald-300">
        <div className="p-2 bg-teal-700 text-rose-400">
          <a href="/" className="text-2xl text-center">
            Welcome to IsaiahGardeen.com
          </a>
        </div>
        <div className="bg-cyan-950">
          <Component />
        </div>
      </body>
    </html>
  );
}

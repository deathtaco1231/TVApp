"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center font-sans">
        <p className="text-sm font-medium text-red-600 dark:text-red-400">
          Something went wrong
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          TVApp failed to start
        </h1>
        <p className="max-w-md text-sm text-zinc-500">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          Try again
        </button>
      </body>
    </html>
  );
}

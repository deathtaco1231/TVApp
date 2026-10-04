"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center 2xl:max-w-[1600px]">
      <p className="text-sm font-medium text-red-600 dark:text-red-400">
        Something went wrong
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">
        We could not load this page
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
    </div>
  );
}

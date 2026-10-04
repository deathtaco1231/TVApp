import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-3 px-4 py-16 text-center 2xl:max-w-[1600px]">
      <p className="text-sm font-medium text-zinc-500">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="max-w-md text-sm text-zinc-500">
        That match or page does not exist. It may have ended, or the link is
        wrong.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
      >
        Back to live
      </Link>
    </div>
  );
}

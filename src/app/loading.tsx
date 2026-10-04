export default function Loading() {
  return (
    <div
      className="mx-auto w-full max-w-7xl px-4 py-8 2xl:max-w-[1600px]"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="h-7 w-40 animate-pulse rounded bg-black/10 dark:bg-white/10" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {["a", "b", "c", "d", "e", "f"].map((id) => (
          <div
            key={id}
            className="h-28 animate-pulse rounded-xl border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5"
          />
        ))}
      </div>
    </div>
  );
}

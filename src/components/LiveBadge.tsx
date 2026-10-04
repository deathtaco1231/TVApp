export function LiveBadge({ className }: { className?: string }) {
  return (
    <span
      aria-label="Live"
      className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400 ${
        className ?? ""
      }`}
    >
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex size-1.5 rounded-full bg-red-500" />
      </span>
      Live
    </span>
  );
}

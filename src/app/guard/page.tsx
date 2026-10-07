import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Popup guard",
  description:
    "Install the companion extension that blocks stream-embed popups in TVApp.",
};

const buttonClass =
  "inline-flex items-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[.98]";

export default function GuardPage() {
  const bundleUrl = process.env.NEXT_PUBLIC_GUARD_BUNDLE_URL;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 2xl:max-w-[1600px]">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        &larr; Back to live
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Popup guard</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Some stream embeds open ad popups (occasionally gambling, adult, or
        malware pages) when you press play. A web page cannot stop a
        cross-origin iframe from doing that, so TVApp ships a tiny companion
        extension that neutralizes <code className="text-xs">window.open</code>{" "}
        inside those embeds. It only touches{" "}
        <code className="text-xs">embed.st</code> frames, and playback is
        unaffected.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <a href="/api/guard/launcher" download className={buttonClass}>
          Windows: no-install launcher (.cmd)
        </a>
        <a
          href="/api/guard/extension"
          download
          className="inline-flex items-center rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-black/30 dark:border-white/15 dark:text-zinc-200 dark:hover:border-white/40"
        >
          Download guard (.zip)
        </a>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold tracking-tight">
          Install in Chrome, Edge, or Brave
        </h2>
        <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm text-zinc-600 dark:text-zinc-300">
          <li>Download the zip above and unzip it to a folder you can find.</li>
          <li>
            Open your browser&apos;s extensions page:{" "}
            <code className="text-xs">chrome://extensions</code> or{" "}
            <code className="text-xs">edge://extensions</code>.
          </li>
          <li>Turn on Developer mode (top-right).</li>
          <li>
            Click <strong>Load unpacked</strong> and select the unzipped folder
            (the one containing <code className="text-xs">manifest.json</code>).
          </li>
          <li>Reload TVApp and open a match — the prompt should disappear.</li>
        </ol>
      </section>

      <div className="mt-8 flex flex-col gap-3 text-sm text-zinc-500">
        <p>
          Firefox uses a different extension model and is not supported.
          Chromium-based browsers only.
        </p>
        <p>
          Chrome Web Store one-click install is planned. Until then, the zip
          above is the fastest path.
        </p>
        {bundleUrl ? (
          <p>
            Can&apos;t or won&apos;t install an extension?{" "}
            <a href={bundleUrl} className="underline">
              Download the portable browser bundle (Windows)
            </a>{" "}
            — it includes a browser with the guard already added.
          </p>
        ) : null}
        <p>
          A layered network-level filter (NextDNS, AdGuard DNS, Pi-hole) is
          still worth keeping. See the README&apos;s &ldquo;Ads and
          safety&rdquo; section.
        </p>
      </div>
    </div>
  );
}

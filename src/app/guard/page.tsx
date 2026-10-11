import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Popup guard",
  description:
    "Block stream-embed popups: install the guard extension or use the no-install Windows launcher.",
};

const buttonClass =
  "inline-flex items-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[.98]";

const outlineButtonClass =
  "inline-flex items-center rounded-lg border border-black/10 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-black/30 dark:border-white/15 dark:text-zinc-200 dark:hover:border-white/40";

const listClass =
  "mt-4 flex list-decimal flex-col gap-2 pl-5 text-sm text-zinc-600 dark:text-zinc-300";

const badgeClass =
  "rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-700 dark:bg-white/10 dark:text-zinc-200";

export default function GuardPage() {
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
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
        <strong>Recommended:</strong> install the guard in your browser. On
        Windows and want zero setup instead? Use the TVApp launcher.
      </p>

      <section className="mt-8">
        <h2 className="flex flex-wrap items-center gap-2 text-sm font-semibold tracking-tight">
          Option 1 — Install the guard in your browser
          <span className={badgeClass}>Recommended</span>
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          The guard is a small extension that blocks the popups. It runs in
          Chrome, Edge, or Brave and stays in your normal browser — no second
          browser and no big download. You download a zip containing the
          extension and load it once.
        </p>
        <a href="/api/guard/extension" download className={`mt-4 ${buttonClass}`}>
          Download guard (.zip)
        </a>
        <ol className={listClass}>
          <li>Unzip the download to a folder you can find.</li>
          <li>
            Open your browser&apos;s extensions page:{" "}
            <code className="text-xs">chrome://extensions</code> or{" "}
            <code className="text-xs">edge://extensions</code>.
          </li>
          <li>Turn on Developer mode (top-right). This is a one-time toggle.</li>
          <li>
            Click <strong>Load unpacked</strong> and select the unzipped folder
            (the one containing <code className="text-xs">manifest.json</code>).
          </li>
          <li>Reload TVApp and open a match — the prompt should disappear.</li>
        </ol>
        <p className="mt-3 text-xs text-zinc-500">
          Chromium-based browsers only (Chrome, Edge, Brave).
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold tracking-tight">
          Option 2 — No install (Windows): the TVApp launcher
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Prefer not to touch extensions? Download one file and double-click it.
          On the first run it fetches a portable browser (Chrome for Testing,
          about 200 MB) plus the guard, then opens TVApp already protected.
          Nothing to configure.
        </p>
        <a href="/api/guard/launcher" download className={`mt-4 ${outlineButtonClass}`}>
          Download launcher (.cmd)
        </a>
        <ul className={`${listClass} list-disc`}>
          <li>Double-click the downloaded file.</li>
          <li>
            If Windows shows &ldquo;Windows protected your PC,&rdquo; choose{" "}
            <strong>More info &rarr; Run anyway</strong>.
          </li>
          <li>
            The first run downloads the browser and takes a few minutes. Later
            runs open instantly.
          </li>
          <li>TVApp opens in its own window, already protected.</li>
        </ul>
        <p className="mt-3 text-xs text-zinc-500">Windows 10/11 only.</p>
      </section>

      <div className="mt-8 flex flex-col gap-3 text-sm text-zinc-500">
        <p>
          Firefox uses a different extension model and is not supported, so the
          guard is Chromium-only.
        </p>
        <p>
          A Chrome Web Store one-click install is planned. Until then, the zip
          and the launcher above are the fastest paths.
        </p>
        <p>
          A layered network-level filter (NextDNS, AdGuard DNS, Pi-hole) is
          still worth keeping. See the README&apos;s &ldquo;Ads and
          safety&rdquo; section.
        </p>
      </div>
    </div>
  );
}

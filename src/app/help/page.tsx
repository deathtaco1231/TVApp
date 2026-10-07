import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to watch",
  description: "Plain steps to watch TVApp and stop stream-embed popups.",
};

const stepList =
  "flex list-decimal flex-col gap-2 pl-5 text-sm text-zinc-600 dark:text-zinc-300";

export default function HelpPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 2xl:max-w-[1600px]">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        &larr; Back to live
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">How to watch</h1>

      <section className="mt-8">
        <h2 className="text-sm font-semibold tracking-tight">Watch a match</h2>
        <ol className={`mt-3 ${stepList}`}>
          <li>Open the TVApp address you were given in Chrome or Edge.</li>
          <li>
            Pick a game from <strong>Live</strong>, <strong>Today</strong>, or the{" "}
            <strong>Sports</strong> menu.
          </li>
          <li>Choose a stream, then press play. That&apos;s it.</li>
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold tracking-tight">
          Stop the ad popups
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Stream embeds sometimes open ad popups (gambling, adult, or scam pages)
          when you press play. They come from the stream site, not TVApp, and no
          web page can block them by itself.
        </p>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
          The easiest fix on Windows is the{" "}
          <a href="/api/guard/launcher" download className="underline">
            no-install launcher
          </a>
          : download it, double-click it, and it opens a browser that already has
          the popup guard. The first run downloads the browser once and may show
          a Windows &ldquo;unrecognized app&rdquo; warning — choose{" "}
          <strong>More info → Run anyway</strong>.
        </p>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
          Prefer to keep your own browser? See the{" "}
          <Link href="/guard" className="underline">
            popup guard
          </Link>{" "}
          page to add it to Chrome, Edge, or Brave.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold tracking-tight">
          On a private network
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          If the host shares TVApp over Tailscale, install Tailscale, sign in,
          and open the address they gave you (for example{" "}
          <code className="text-xs">http://tvapp:3000</code>). Only devices on
          that private network can reach it.
        </p>
      </section>
    </div>
  );
}

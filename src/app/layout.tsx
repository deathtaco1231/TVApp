import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { SportsMenu } from "@/components/SportsMenu";
import { NavLink } from "@/components/NavLink";
import { getSports } from "@/lib/streamed/sports";
import type { Sport } from "@/lib/streamed/types";
import { formatVersionLabel } from "@/lib/version";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: { default: "TVApp", template: "%s · TVApp" },
  description: "Live sports streaming browser powered by the Streamed API.",
  openGraph: {
    type: "website",
    siteName: "TVApp",
    title: "TVApp",
    description: "Live sports streaming browser powered by the Streamed API.",
  },
  twitter: {
    card: "summary",
    title: "TVApp",
    description: "Live sports streaming browser powered by the Streamed API.",
  },
};

const navLink =
  "text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  let sports: Sport[] = [];
  try {
    sports = await getSports();
  } catch {
    sports = [];
  }

  const versionLabel = formatVersionLabel(
    process.env.NEXT_PUBLIC_APP_VERSION ?? "",
  );

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <header className="border-b border-black/10 dark:border-white/10">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 2xl:max-w-[1600px]">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              TVApp
            </Link>

            <nav
              aria-label="Primary"
              className="flex items-center gap-4"
            >
              <NavLink href="/" exact>
                Live
              </NavLink>
              <NavLink href="/schedule">Today</NavLink>

              <SportsMenu sports={sports} />

              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/help">Help</NavLink>
            </nav>

            <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2">
              <NavLink href="/guard">Popup guard</NavLink>
              <a
                href="https://streamed.pk/docs"
                target="_blank"
                rel="noopener noreferrer"
                className={navLink}
              >
                API docs
              </a>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col">{children}</main>

        <footer className="border-t border-black/10 px-4 py-6 text-center text-xs text-zinc-500 dark:border-white/10">
          <p>
            Data from the public Streamed API. TVApp only links to third-party
            streams.{" "}
            <Link href="/help" className="underline hover:text-zinc-900 dark:hover:text-zinc-100">
              How to watch
            </Link>
          </p>
          {versionLabel ? (
            <p className="mt-1 text-zinc-400 dark:text-zinc-600">
              {versionLabel}
            </p>
          ) : null}
        </footer>
      </body>
    </html>
  );
}

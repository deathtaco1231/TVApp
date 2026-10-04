import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { SportsMenu } from "@/components/SportsMenu";
import { getSports } from "@/lib/streamed/sports";
import type { Sport } from "@/lib/streamed/types";
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
  title: "TVApp",
  description: "Live sports streaming browser powered by the Streamed API.",
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

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <header className="border-b border-black/10 dark:border-white/10">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              TVApp
            </Link>

            <nav
              aria-label="Primary"
              className="flex items-center gap-4"
            >
              <Link href="/" className={navLink}>
                Live
              </Link>
              <Link href="/schedule" className={navLink}>
                Today
              </Link>

              <SportsMenu sports={sports} />
            </nav>

            <a
              href="https://streamed.pk/docs"
              target="_blank"
              rel="noopener noreferrer"
              className={`ml-auto ${navLink}`}
            >
              API docs
            </a>
          </div>
        </header>

        <main className="flex flex-1 flex-col">{children}</main>

        <footer className="border-t border-black/10 px-4 py-6 text-center text-xs text-zinc-500 dark:border-white/10">
          Data from the public Streamed API. TVApp only links to third-party
          streams.
        </footer>
      </body>
    </html>
  );
}

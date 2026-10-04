import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <header className="border-b border-black/10 dark:border-white/10">
          <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-3">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              TVApp
            </Link>
            <a
              href="https://streamed.pk/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
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

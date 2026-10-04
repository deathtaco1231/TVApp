import Link from "next/link";
import { notFound } from "next/navigation";

import { MatchStreams } from "@/components/MatchStreams";
import { getAllMatches, findMatchById } from "@/lib/streamed/matches";
import { getStreamsForSources } from "@/lib/streamed/streams";
import type { APIMatch, Stream } from "@/lib/streamed/types";

export const revalidate = 30;

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let match: APIMatch | undefined;
  try {
    const matches = await getAllMatches();
    match = findMatchById(matches, id);
  } catch {
    match = undefined;
  }

  if (!match) {
    notFound();
  }

  const streams: Stream[] = await getStreamsForSources(match.sources);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        &larr; Back to live
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        {match.title}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        {match.category} · {new Date(match.date).toLocaleString()}
      </p>

      <div className="mt-6">
        <MatchStreams streams={streams} />
      </div>
    </div>
  );
}

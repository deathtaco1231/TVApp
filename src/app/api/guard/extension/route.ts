import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { zipSync } from "fflate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXTENSION_DIR = path.join(process.cwd(), "extension");

export async function GET() {
  try {
    const entries = await readdir(EXTENSION_DIR, { withFileTypes: true });
    const files: Record<string, Uint8Array> = {};
    for (const entry of entries) {
      if (!entry.isFile()) {
        continue;
      }
      const buffer = await readFile(path.join(EXTENSION_DIR, entry.name));
      files[entry.name] = new Uint8Array(buffer);
    }

    const zip = zipSync(files);
    return new Response(zip, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="tvapp-guard.zip"',
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Guard files are unavailable.", { status: 500 });
  }
}

import { buildLauncherScript, sanitizeBaseUrl } from "@/lib/launcher";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const url = new URL(request.url);
  const proto =
    request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    url.host;
  const base =
    sanitizeBaseUrl(`${proto}://${host}`) ?? `${url.protocol}//${url.host}`;

  return new Response(buildLauncherScript(base), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": 'attachment; filename="TVApp-Guard.cmd"',
      "Cache-Control": "no-store",
    },
  });
}

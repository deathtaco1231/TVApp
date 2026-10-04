import type { MetadataRoute } from "next";

// Static routes only: dynamic sport/match pages are already linked from the
// header and would add a build-time API dependency for little SEO value here.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const lastModified = new Date();
  return ["/", "/schedule", "/dashboard"].map((path) => ({
    url: `${base}${path}`,
    lastModified,
  }));
}

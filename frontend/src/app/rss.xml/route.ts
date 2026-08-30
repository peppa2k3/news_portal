import type { ArticleSummary } from "@/types";
import { getHomepageData } from "@/services/api";
import { siteUrl } from "@/lib/site";

export const revalidate = 300;

const escapeXml = (value: string) =>
  value.replace(/[<>&'\"]/g, (char) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;" })[char] || char,
  );

export async function GET() {
  const base = siteUrl();
  let items: ArticleSummary[] = [];
  try {
    const response = await getHomepageData();
    if (response.success) items = response.data.latest_articles;
  } catch {
    // A valid empty feed keeps image builds independent from API availability.
  }

  const entries = items.map((item) =>
    `<item><title>${escapeXml(item.title)}</title><link>${base}/tin-tuc/${escapeXml(item.slug)}</link><guid>${base}/tin-tuc/${escapeXml(item.slug)}</guid>${item.excerpt ? `<description>${escapeXml(item.excerpt)}</description>` : ""}${item.published_at ? `<pubDate>${new Date(item.published_at).toUTCString()}</pubDate>` : ""}</item>`,
  ).join("");
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>News Portal</title><link>${base}</link><description>Tin tức mới nhất</description><language>vi</language>${entries}</channel></rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
    },
  });
}

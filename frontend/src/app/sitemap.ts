import type { MetadataRoute } from "next"; import { getSitemapArticles } from "@/services/api"; import { siteUrl } from "@/lib/site";
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl(); const fixed = ["", "/gioi-thieu", "/lien-he", "/chinh-sach-bao-mat", "/dieu-khoan"].map((path) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: path ? "monthly" as const : "hourly" as const, priority: path ? .4 : 1 }));
  try { const response = await getSitemapArticles(); if (!response.success) return fixed; return [...fixed, ...response.data.items.map((article) => ({ url: `${base}/tin-tuc/${article.slug}`, lastModified: new Date(article.updated_at), changeFrequency: "daily" as const, priority: .8 }))]; } catch { return fixed; }
}

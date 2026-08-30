import type { Metadata } from "next";
import { ArticleListing } from "@/components/articles/ArticleListing";
import { searchArticles } from "@/services/api";

export const metadata: Metadata = { title: "Tìm kiếm", robots: { index: false, follow: true } };
export const dynamic = "force-dynamic";
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const query = await searchParams; const q = (query.q || "").trim().slice(0, 120); const page = Math.max(1, Number.parseInt(query.page || "1", 10) || 1);
  const response = await searchArticles(q, page); if (!response.success) throw new Error(response.error.message);
  return <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><form action="/tim-kiem" method="get" role="search" className="mb-8 flex max-w-2xl gap-3"><label className="sr-only" htmlFor="search-q">Từ khóa</label><input id="search-q" name="q" defaultValue={q} required minLength={2} maxLength={120} placeholder="Nhập từ khóa cần tìm…" className="field-input" /><button className="btn-primary">Tìm kiếm</button></form><ArticleListing title={q ? `Kết quả cho “${q}”` : "Tìm kiếm bài viết"} items={response.data.items} pagination={response.data.pagination} path="/tim-kiem" query={{ q }} /></main>;
}

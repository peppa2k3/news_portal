import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { NewsImage } from "@/components/ui/NewsImage";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import { formatDate } from "@/lib/site";
import { getPreviewArticle } from "@/services/api";

export const metadata: Metadata = { title: "Xem trước bài viết", robots: { index: false, follow: false, noarchive: true } };
export const dynamic = "force-dynamic";

export default async function PreviewPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const response = await getPreviewArticle(token).catch(() => null);
  if (!response?.success) notFound();
  const article = response.data.article;
  return <main className="mx-auto min-h-screen max-w-4xl px-4 py-8"><div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 font-bold text-amber-900">Bản xem trước riêng tư · Không chia sẻ URL này.</div><Breadcrumb items={[{ name: "CMS", href: "/admin/articles" }, { name: "Xem trước" }]} /><article><p className="text-sm font-bold uppercase text-red-700">{article.category.name}</p><h1 className="mt-3 text-4xl font-black">{article.title}</h1>{article.excerpt && <p className="mt-4 text-xl text-slate-600">{article.excerpt}</p>}<p className="mt-4 text-sm text-slate-500">Cập nhật {formatDate(article.updated_at)}</p><NewsImage src={article.thumbnail_url} alt={article.thumbnail_alt || article.title} className="mt-7 aspect-video rounded-2xl" /><div className="article-content mt-8" dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.content_html) }} /></article></main>;
}

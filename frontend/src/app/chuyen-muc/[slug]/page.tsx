import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/articles/ArticleCard";
import { getCategoryArticles } from "@/services/api";
import { absoluteUrl } from "@/lib/site";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

function parsePage(value: string | undefined): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const response = await getCategoryArticles(slug, parsePage(query.page));

  if (!response.success) return {};

  return {
    title: response.data.category.meta_title ?? response.data.category.name,
    description: response.data.category.meta_desc ?? undefined,
    alternates: { canonical: absoluteUrl(`/chuyen-muc/${slug}`) },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const page = parsePage(query.page);
  const response = await getCategoryArticles(slug, page);

  if (!response.success) notFound();

  const { category, items, pagination } = response.data;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-5 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-red-600">
          Trang chủ
        </Link>
        {category.breadcrumb.map((item) => (
          <span key={item.id}>
            {" / "}
            <Link
              href={`/chuyen-muc/${item.slug}`}
              className="hover:text-red-600"
            >
              {item.name}
            </Link>
          </span>
        ))}
      </nav>

      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">
          {category.name}
        </h1>
        {category.meta_desc ? (
          <p className="mt-3 max-w-3xl text-slate-600">{category.meta_desc}</p>
        ) : null}
      </div>

      {items.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-white p-8 text-center text-slate-600">
          Danh mục này chưa có bài viết.
        </p>
      )}

      {pagination.total_pages > 1 ? (
        <nav className="mt-10 flex justify-center gap-3" aria-label="Phân trang">
          {pagination.has_previous_page ? (
            <Link
              href={`/chuyen-muc/${slug}?page=${page - 1}`}
              className="rounded-full border border-slate-300 bg-white px-5 py-2 font-semibold hover:border-red-600 hover:text-red-600"
            >
              ← Trang trước
            </Link>
          ) : null}
          <span className="rounded-full bg-slate-950 px-5 py-2 font-semibold text-white">
            {page} / {pagination.total_pages}
          </span>
          {pagination.has_next_page ? (
            <Link
              href={`/chuyen-muc/${slug}?page=${page + 1}`}
              className="rounded-full border border-slate-300 bg-white px-5 py-2 font-semibold hover:border-red-600 hover:text-red-600"
            >
              Trang sau →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}

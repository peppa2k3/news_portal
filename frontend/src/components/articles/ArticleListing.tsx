import { ArticleCard } from "./ArticleCard";
import { Pagination } from "@/components/ui/Pagination";
import type { ArticleSummary, PaginationMeta } from "@/types";

export function ArticleListing({ title, description, items, pagination, path, query }: { title: string; description?: string | null; items: ArticleSummary[]; pagination: PaginationMeta; path: string; query?: Record<string, string> }) {
  return (
    <>
      <header className="mb-8 border-b border-slate-200 pb-5"><h1 className="text-3xl font-black sm:text-4xl">{title}</h1>{description && <p className="mt-3 max-w-3xl text-slate-600">{description}</p>}</header>
      {items.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map((article) => <ArticleCard key={article.id} article={article} />)}</div> : <p className="rounded-2xl bg-white p-8 text-center text-slate-600">Chưa có bài viết phù hợp.</p>}
      <Pagination pagination={pagination} path={path} query={query} />
    </>
  );
}

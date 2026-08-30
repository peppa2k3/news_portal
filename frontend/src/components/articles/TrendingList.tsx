import Link from "next/link";
import type { ArticleSummary } from "@/types";

export function TrendingList({ articles }: { articles: ArticleSummary[] }) {
  if (!articles.length) return null;
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5" aria-labelledby="trending-title">
      <h2 id="trending-title" className="text-xl font-black">Đọc nhiều</h2>
      <ol className="mt-4 divide-y divide-slate-100">
        {articles.slice(0, 6).map((article, index) => (
          <li key={article.id} className="grid grid-cols-[2rem_1fr] gap-3 py-4">
            <span className="text-2xl font-black text-red-600">{index + 1}</span>
            <Link className="font-bold leading-snug hover:text-red-700" href={`/tin-tuc/${article.slug}`}>{article.title}</Link>
          </li>
        ))}
      </ol>
    </aside>
  );
}

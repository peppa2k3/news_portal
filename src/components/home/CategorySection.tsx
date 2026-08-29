import Link from "next/link";

import type { HomepageCategorySection } from "@/types";

import { ArticleCard } from "../articles/ArticleCard";

interface CategorySectionProps {
  section: HomepageCategorySection;
}

export function CategorySection({ section }: CategorySectionProps) {
  const { category, articles } = section;

  return (
    <section aria-labelledby={`category-${category.slug}`}>
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <span className="h-7 w-1.5 rounded-full bg-red-600" />
          <h2
            id={`category-${category.slug}`}
            className="text-2xl font-extrabold tracking-tight text-slate-950"
          >
            {category.name}
          </h2>
        </div>

        <Link
          href={`/chuyen-muc/${category.slug}`}
          className="shrink-0 text-sm font-semibold text-red-600 hover:text-red-700"
        >
          Xem tất cả →
        </Link>
      </div>

      {articles.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-slate-100 p-6 text-slate-600">
          Danh mục này chưa có bài viết.
        </p>
      )}
    </section>
  );
}

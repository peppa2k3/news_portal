import type { ArticleSummary } from "@/types";

import { ArticleCard } from "../articles/ArticleCard";

interface FeaturedArticlesProps {
  articles: ArticleSummary[];
}

export function FeaturedArticles({ articles }: FeaturedArticlesProps) {
  const [mainArticle, ...secondaryArticles] = articles;

  return (
    <section aria-labelledby="featured-heading">
      <div className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-3">
        <span className="h-7 w-1.5 rounded-full bg-red-600" />
        <h2
          id="featured-heading"
          className="text-2xl font-extrabold tracking-tight text-slate-950"
        >
          Tin nổi bật
        </h2>
      </div>

      {mainArticle ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,1fr)]">
          <ArticleCard article={mainArticle} variant="featured" priority />

          {secondaryArticles.length > 0 ? (
            <div className="grid content-start gap-5">
              {secondaryArticles.slice(0, 2).map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  variant="compact"
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <p className="rounded-2xl bg-slate-100 p-6 text-slate-600">
          Chưa có tin nổi bật.
        </p>
      )}
    </section>
  );
}

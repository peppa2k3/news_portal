import Link from "next/link";

import type { ArticleSummary } from "@/types";

type ArticleCardVariant = "default" | "featured" | "compact";

interface ArticleCardProps {
  article: ArticleSummary;
  variant?: ArticleCardVariant;
  priority?: boolean;
}

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatPublishedDate(value: string | null): string {
  if (!value) return "Chưa xuất bản";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Chưa rõ ngày đăng"
    : dateFormatter.format(date);
}

export function ArticleCard({
  article,
  variant = "default",
  priority = false,
}: ArticleCardProps) {
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact";

  return (
    <article
      className={
        isCompact
          ? "group grid grid-cols-[120px_1fr] gap-4"
          : "group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      }
    >
      <Link
        href={`/tin-tuc/${article.slug}`}
        className={
          isCompact
            ? "relative block aspect-[4/3] overflow-hidden rounded-xl bg-slate-100"
            : `relative block overflow-hidden bg-slate-100 ${
                isFeatured ? "aspect-[16/9]" : "aspect-[16/10]"
              }`
        }
        aria-label={article.title}
      >
        {article.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.thumbnail_url}
            alt={article.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Chưa có ảnh
          </div>
        )}
      </Link>

      <div className={isCompact ? "min-w-0 py-1" : "p-5"}>
        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <Link
            href={`/chuyen-muc/${article.category.slug}`}
            className="font-semibold uppercase tracking-wide text-red-600 hover:text-red-700"
          >
            {article.category.name}
          </Link>
          <time
            dateTime={article.published_at ?? undefined}
            className="text-slate-500"
          >
            {formatPublishedDate(article.published_at)}
          </time>
        </div>

        <h3
          className={`font-bold leading-snug text-slate-900 group-hover:text-red-700 ${
            isFeatured
              ? "text-2xl sm:text-3xl"
              : isCompact
                ? "line-clamp-3 text-base"
                : "line-clamp-2 text-xl"
          }`}
        >
          <Link href={`/tin-tuc/${article.slug}`}>{article.title}</Link>
        </h3>

        {!isCompact && article.excerpt ? (
          <p
            className={`mt-3 text-slate-600 ${
              isFeatured ? "line-clamp-3 text-base" : "line-clamp-2 text-sm"
            }`}
          >
            {article.excerpt}
          </p>
        ) : null}
      </div>
    </article>
  );
}

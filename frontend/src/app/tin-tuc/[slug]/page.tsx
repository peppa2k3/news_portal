import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/articles/ArticleCard";
import { getArticleDetail } from "@/services/api";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "long",
  timeStyle: "short",
});

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const response = await getArticleDetail(slug);

  if (!response.success) return {};

  const { article } = response.data;
  return {
    title: article.meta_title ?? article.title,
    description: article.meta_desc ?? article.excerpt ?? undefined,
    openGraph: {
      title: article.meta_title ?? article.title,
      description: article.meta_desc ?? article.excerpt ?? undefined,
      images: article.thumbnail_url ? [article.thumbnail_url] : undefined,
      type: "article",
      publishedTime: article.published_at ?? undefined,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const response = await getArticleDetail(slug);

  if (!response.success) notFound();

  const { article, related_articles } = response.data;

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl">
        <nav className="mb-6 text-sm text-slate-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-red-600">
            Trang chủ
          </Link>
          {" / "}
          <Link
            href={`/chuyen-muc/${article.category.slug}`}
            className="hover:text-red-600"
          >
            {article.category.name}
          </Link>
        </nav>

        <Link
          href={`/chuyen-muc/${article.category.slug}`}
          className="text-sm font-bold uppercase tracking-wider text-red-600"
        >
          {article.category.name}
        </Link>
        <h1 className="mt-3 text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
          {article.title}
        </h1>

        {article.excerpt ? (
          <p className="mt-5 text-xl leading-8 text-slate-600">
            {article.excerpt}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-b border-slate-200 pb-6 text-sm text-slate-500">
          {article.author?.full_name ? (
            <span>Tác giả: {article.author.full_name}</span>
          ) : null}
          {article.published_at ? (
            <time dateTime={article.published_at}>
              {dateFormatter.format(new Date(article.published_at))}
            </time>
          ) : null}
          <span>{article.view_count} lượt xem</span>
        </div>

        {article.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.thumbnail_url}
            alt={article.title}
            className="mt-8 aspect-video w-full rounded-2xl object-cover"
          />
        ) : null}

        <div
          className="article-content mt-8"
          dangerouslySetInnerHTML={{ __html: article.content_html }}
        />

        {article.tags.length > 0 ? (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-slate-200 pt-6">
            {article.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-slate-200 px-3 py-1 text-sm text-slate-700"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        ) : null}
      </article>

      {related_articles.length > 0 ? (
        <section className="mt-16" aria-labelledby="related-heading">
          <h2
            id="related-heading"
            className="mb-6 border-b border-slate-200 pb-3 text-2xl font-black"
          >
            Bài viết liên quan
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related_articles.map((related) => (
              <ArticleCard key={related.id} article={related} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

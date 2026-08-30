import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { AuthorBox } from "@/components/articles/AuthorBox";
import { CommentSection } from "@/components/articles/CommentSection";
import { ShareButtons } from "@/components/articles/ShareButtons";
import { ViewCounter } from "@/components/articles/ViewCounter";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { NewsImage } from "@/components/ui/NewsImage";
import { sanitizeArticleHtml } from "@/lib/sanitize";
import { absoluteUrl, formatDate } from "@/lib/site";
import { ApiRequestError, getArticleDetail } from "@/services/api";

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const response = await getArticleDetail(slug);
    if (!response.success) return {};
    const article = response.data.article;
    const canonical = article.canonical_url || absoluteUrl(`/tin-tuc/${article.slug}`);
    const image = article.og_image_url || article.thumbnail_url || undefined;
    return {
      title: article.meta_title || article.title,
      description: article.meta_desc || article.excerpt || undefined,
      alternates: { canonical },
      openGraph: { type: "article", url: canonical, title: article.meta_title || article.title, description: article.meta_desc || article.excerpt || undefined, images: image ? [{ url: image, alt: article.thumbnail_alt || article.title }] : undefined, publishedTime: article.published_at || undefined, modifiedTime: article.updated_at, authors: article.author?.full_name ? [article.author.full_name] : undefined },
      twitter: { card: "summary_large_image", title: article.meta_title || article.title, description: article.meta_desc || article.excerpt || undefined, images: image ? [image] : undefined },
    };
  } catch { return {}; }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  let response;
  try { response = await getArticleDetail(slug); } catch (error) {
    if (error instanceof ApiRequestError && [404, 410].includes(error.status)) notFound();
    throw error;
  }
  if (!response.success) notFound();
  const { article, related_articles } = response.data;
  const safeHtml = sanitizeArticleHtml(article.content_html);
  const jsonLd = { "@context": "https://schema.org", "@type": "NewsArticle", headline: article.title, description: article.excerpt, image: article.thumbnail_url ? [article.thumbnail_url] : undefined, datePublished: article.published_at, dateModified: article.updated_at, mainEntityOfPage: absoluteUrl(`/tin-tuc/${article.slug}`), author: article.author?.full_name ? { "@type": "Person", name: article.author.full_name, url: article.author.slug ? absoluteUrl(`/tac-gia/${article.author.slug}`) : undefined } : undefined, publisher: { "@type": "NewsMediaOrganization", name: "News Portal", url: absoluteUrl("/") } };
  const commentsEnabled = process.env.NEXT_PUBLIC_COMMENTS_ENABLED === "true";

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl">
        <Breadcrumb items={[{ name: "Trang chủ", href: "/" }, { name: article.category.name, href: `/chuyen-muc/${article.category.slug}` }, { name: article.title }]} />
        <Link href={`/chuyen-muc/${article.category.slug}`} className="text-sm font-bold uppercase tracking-wider text-red-700">{article.category.name}</Link>
        <h1 className="mt-3 text-4xl font-black leading-tight text-slate-950 sm:text-5xl">{article.title}</h1>
        {article.excerpt && <p className="mt-5 text-xl leading-8 text-slate-600">{article.excerpt}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-4 border-b border-slate-200 pb-6 text-sm text-slate-500">
          {article.author?.full_name && <span>Tác giả: {article.author.slug ? <Link className="font-bold text-slate-700" href={`/tac-gia/${article.author.slug}`}>{article.author.full_name}</Link> : article.author.full_name}</span>}
          {article.published_at && <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>}
          <ViewCounter slug={article.slug} initialCount={article.view_count} />
          <ShareButtons title={article.title} />
        </div>
        <NewsImage src={article.thumbnail_url} alt={article.thumbnail_alt || article.title} priority className="mt-8 aspect-video w-full rounded-2xl" />
        <div className="article-content mt-8" dangerouslySetInnerHTML={{ __html: safeHtml }} />
        {!!article.tags.length && <div className="mt-10 flex flex-wrap gap-2 border-t border-slate-200 pt-6">{article.tags.map((tag) => <Link key={tag.id} href={`/tag/${tag.slug}`} className="rounded-full bg-slate-200 px-3 py-1 text-sm hover:bg-red-100 hover:text-red-700">#{tag.name}</Link>)}</div>}
        {article.author && <AuthorBox author={article.author} />}
        {commentsEnabled && <CommentSection slug={article.slug} />}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      </article>
      {!!related_articles.length && <section className="mt-16" aria-labelledby="related-heading"><h2 id="related-heading" className="mb-6 border-b border-slate-200 pb-3 text-2xl font-black">Bài viết liên quan</h2><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{related_articles.map((item) => <ArticleCard key={item.id} article={item} />)}</div></section>}
    </main>
  );
}

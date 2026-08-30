import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleListing } from "@/components/articles/ArticleListing";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { NewsImage } from "@/components/ui/NewsImage";
import { absoluteUrl } from "@/lib/site";
import { getAuthorArticles } from "@/services/api";

interface Props { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }
const pageNumber = (value?: string) => Math.max(1, Number.parseInt(value || "1", 10) || 1);
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; return { title: `Tác giả ${slug}`, alternates: { canonical: absoluteUrl(`/tac-gia/${slug}`) } }; }
export default async function AuthorPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const response = await getAuthorArticles(slug, pageNumber(query.page)); if (!response.success) notFound();
  const { author, items, pagination } = response.data;
  return <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><Breadcrumb items={[{ name: "Trang chủ", href: "/" }, { name: author.full_name || "Tác giả" }]} /><div className="mb-8 flex items-center gap-5"><NewsImage src={author.avatar_url} alt={author.full_name || "Tác giả"} className="h-24 w-24 rounded-full" /><div><h1 className="text-3xl font-black">{author.full_name}</h1>{author.bio && <p className="mt-2 max-w-2xl text-slate-600">{author.bio}</p>}</div></div><ArticleListing title="Bài viết của tác giả" items={items} pagination={pagination} path={`/tac-gia/${slug}`} /></main>;
}

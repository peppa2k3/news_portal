import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleListing } from "@/components/articles/ArticleListing";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { absoluteUrl } from "@/lib/site";
import { getTagArticles } from "@/services/api";

interface Props { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }
const pageNumber = (value?: string) => Math.max(1, Number.parseInt(value || "1", 10) || 1);
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; return { title: `Tag #${slug}`, alternates: { canonical: absoluteUrl(`/tag/${slug}`) } }; }
export default async function TagPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const response = await getTagArticles(slug, pageNumber(query.page));
  if (!response.success) notFound();
  const { tag, items, pagination } = response.data;
  return <main className="mx-auto min-h-screen max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><Breadcrumb items={[{ name: "Trang chủ", href: "/" }, { name: `Tag #${tag.name}` }]} /><ArticleListing title={`#${tag.name}`} items={items} pagination={pagination} path={`/tag/${slug}`} /></main>;
}

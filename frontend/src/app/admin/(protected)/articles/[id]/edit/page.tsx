import { ArticleEditor } from "@/components/admin/ArticleEditor"; import { RevisionHistory } from "@/components/admin/RevisionHistory";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <><ArticleEditor articleId={id} /><div className="mt-6 max-w-xl"><RevisionHistory articleId={id} /></div></>; }

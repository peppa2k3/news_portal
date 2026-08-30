import { Breadcrumb } from "@/components/ui/Breadcrumb";

export function StaticPage({ title, children }: { title: string; children: React.ReactNode }) {
  return <main className="mx-auto min-h-[60vh] max-w-4xl px-4 py-10 sm:px-6"><Breadcrumb items={[{ name: "Trang chủ", href: "/" }, { name: title }]} /><article className="rounded-2xl bg-white p-6 shadow-sm sm:p-10"><h1 className="text-3xl font-black">{title}</h1><div className="article-content mt-6">{children}</div></article></main>;
}

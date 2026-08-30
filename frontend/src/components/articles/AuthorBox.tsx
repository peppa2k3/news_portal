import Link from "next/link";
import type { AuthorSummary } from "@/types";
import { NewsImage } from "@/components/ui/NewsImage";

export function AuthorBox({ author }: { author: AuthorSummary & { bio?: string | null } }) {
  return (
    <aside className="mt-10 flex gap-4 rounded-2xl bg-slate-100 p-5">
      <NewsImage src={author.avatar_url} alt={author.full_name ?? "Tác giả"} className="h-16 w-16 shrink-0 rounded-full" />
      <div><p className="text-sm text-slate-500">Tác giả</p><h2 className="font-black">{author.slug ? <Link href={`/tac-gia/${author.slug}`}>{author.full_name}</Link> : author.full_name}</h2>{author.bio && <p className="mt-1 text-sm text-slate-600">{author.bio}</p>}</div>
    </aside>
  );
}

import Link from "next/link";
import type { PaginationMeta } from "@/types";

export function Pagination({ pagination, path, query = {} }: { pagination: PaginationMeta; path: string; query?: Record<string, string> }) {
  if (pagination.total_pages <= 1) return null;
  const href = (page: number) => {
    const params = new URLSearchParams({ ...query, page: String(page) });
    return `${path}?${params.toString()}`;
  };
  return (
    <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Phân trang">
      {pagination.has_previous_page && <Link className="btn-secondary" href={href(pagination.page - 1)}>← Trước</Link>}
      <span className="rounded-full bg-slate-950 px-5 py-2 text-sm font-bold text-white">{pagination.page} / {pagination.total_pages}</span>
      {pagination.has_next_page && <Link className="btn-secondary" href={href(pagination.page + 1)}>Sau →</Link>}
    </nav>
  );
}

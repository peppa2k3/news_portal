"use client";

import Link from "next/link";
import { useState } from "react";
import type { CategoryTreeNode } from "@/types";

export function MobileNavigation({ categories }: { categories: CategoryTreeNode[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button type="button" className="rounded-lg border border-slate-300 p-2" aria-expanded={open} aria-controls="mobile-menu" aria-label="Mở menu" onClick={() => setOpen((value) => !value)}>
        <span aria-hidden="true" className="text-xl">{open ? "×" : "☰"}</span>
      </button>
      {open && (
        <nav id="mobile-menu" className="absolute inset-x-0 top-full max-h-[70vh] overflow-auto border-t border-slate-200 bg-white p-4 shadow-lg" aria-label="Điều hướng di động">
          <Link className="mobile-link" href="/" onClick={() => setOpen(false)}>Trang chủ</Link>
          {categories.map((category) => <Link key={category.id} className="mobile-link" href={`/chuyen-muc/${category.slug}`} onClick={() => setOpen(false)}>{category.name}</Link>)}
          <Link className="mobile-link" href="/tim-kiem" onClick={() => setOpen(false)}>Tìm kiếm</Link>
        </nav>
      )}
    </div>
  );
}

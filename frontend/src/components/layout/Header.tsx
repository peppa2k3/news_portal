import Link from "next/link";

import { getMenu } from "@/services/api";
import { MobileNavigation } from "./MobileNavigation";

export async function Header() {
  let menu: Awaited<ReturnType<typeof getMenu>> | null = null;

  try {
    menu = await getMenu();
  } catch {
    // Keep the website usable if the menu endpoint is temporarily unavailable.
  }

  const categories = menu?.success ? menu.data : [];

  return (
    <header className="site-header sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 text-2xl font-black tracking-tight">
          NEWS<span className="text-red-600">PORTAL</span>
        </Link>
        <nav
          className="hidden min-w-0 items-center gap-5 overflow-x-auto text-sm font-semibold whitespace-nowrap md:flex"
          aria-label="Điều hướng chính"
        >
          <Link href="/" className="hover:text-red-600">
            Trang chủ
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/chuyen-muc/${category.slug}`}
              className="hover:text-red-600"
            >
              {category.name}
            </Link>
          ))}
          <Link href="/tim-kiem" className="rounded-full border border-slate-300 px-3 py-1.5 hover:border-red-600 hover:text-red-600">Tìm kiếm</Link>
        </nav>
        <MobileNavigation categories={categories} />
      </div>
    </header>
  );
}

import Link from "next/link";

import { getMenu } from "@/services/api";

export async function Header() {
  let menu: Awaited<ReturnType<typeof getMenu>> | null = null;

  try {
    menu = await getMenu();
  } catch {
    // Keep the website usable if the menu endpoint is temporarily unavailable.
  }

  const categories = menu?.success ? menu.data : [];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 text-2xl font-black tracking-tight">
          NEWS<span className="text-red-600">PORTAL</span>
        </Link>
        <nav
          className="flex min-w-0 items-center gap-5 overflow-x-auto text-sm font-semibold whitespace-nowrap"
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
        </nav>
      </div>
    </header>
  );
}

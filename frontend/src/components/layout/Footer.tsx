import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 bg-slate-950 text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <Link href="/" className="text-xl font-black text-white">
            NEWS<span className="text-red-500">PORTAL</span>
          </Link>
          <p className="mt-2 text-sm text-slate-400">
            Tin tức mới nhất, chính xác và đáng tin cậy.
          </p>
        </div>
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} News Portal.
        </p>
      </div>
    </footer>
  );
}

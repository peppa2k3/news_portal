import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer mt-16 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <Link href="/" className="text-xl font-black text-white">
            NEWS<span className="text-red-500">PORTAL</span>
          </Link>
          <p className="mt-2 text-sm text-slate-400">
            Tin tức mới nhất, chính xác và đáng tin cậy.
          </p>
        </div>
        <nav className="grid content-start gap-2 text-sm" aria-label="Thông tin"><Link href="/gioi-thieu">Giới thiệu</Link><Link href="/lien-he">Liên hệ</Link><Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link><Link href="/dieu-khoan">Điều khoản sử dụng</Link><Link href="/rss.xml">RSS</Link></nav>
        <p className="text-sm text-slate-500 md:text-right">© {new Date().getFullYear()} News Portal.<br />Nội dung được bảo vệ theo quy định.</p>
      </div>
    </footer>
  );
}

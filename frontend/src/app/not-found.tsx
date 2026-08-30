import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-black text-red-600">404</p>
      <h1 className="mt-4 text-3xl font-black text-slate-950">
        Không tìm thấy nội dung
      </h1>
      <p className="mt-3 text-slate-600">
        Bài viết hoặc danh mục này có thể đã được di chuyển.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-slate-950 px-6 py-3 font-semibold text-white hover:bg-red-600"
      >
        Về trang chủ
      </Link>
    </main>
  );
}

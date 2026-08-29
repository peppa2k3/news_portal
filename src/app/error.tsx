"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-red-600">
        Đã xảy ra lỗi
      </p>
      <h1 className="mt-3 text-3xl font-black text-slate-950">
        Không thể tải dữ liệu lúc này
      </h1>
      <p className="mt-3 text-slate-600">
        Vui lòng thử lại sau ít phút hoặc kiểm tra kết nối tới Backend.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
      >
        Thử lại
      </button>
    </main>
  );
}

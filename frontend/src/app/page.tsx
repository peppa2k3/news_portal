import { CategorySection } from "@/components/home/CategorySection";
import { FeaturedArticles } from "@/components/home/FeaturedArticles";
import { getHomepageData } from "@/services/api";

export default async function HomePage() {
  let response: Awaited<ReturnType<typeof getHomepageData>>;

  try {
    response = await getHomepageData();
  } catch {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <p className="text-sm font-bold uppercase tracking-widest text-red-600">
          Tạm thời gián đoạn
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-950">
          Chưa thể tải tin tức
        </h1>
        <p className="mt-3 text-slate-600">
          Hệ thống sẽ tự động thử lại khi Backend sẵn sàng.
        </p>
      </main>
    );
  }

  if (!response.success) {
    throw new Error(response.error.message);
  }

  const { featured_articles, category_sections } = response.data;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-14 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <FeaturedArticles articles={featured_articles} />

        {category_sections.length > 0 ? (
          category_sections.map((section) => (
            <CategorySection key={section.category.id} section={section} />
          ))
        ) : (
          <p className="rounded-2xl bg-white p-8 text-center text-slate-600 shadow-sm">
            Chưa có danh mục tin để hiển thị.
          </p>
        )}
      </div>
    </main>
  );
}

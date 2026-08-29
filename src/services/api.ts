import type {
  ArticleDetailResponse,
  CategoryArticlesResponse,
  HomepageResponse,
  MenuResponse,
} from "@/types";

const API_URL = process.env.API_URL?.replace(/\/$/, "");

interface NextFetchConfig {
  revalidate: number;
  tags: string[];
}

interface NextFetchInit extends RequestInit {
  next: NextFetchConfig;
}

function getApiUrl(path: string): string {
  if (!API_URL) {
    throw new Error("Missing required environment variable: API_URL");
  }

  return `${API_URL}${path}`;
}

async function fetchApi<T>(path: string, init: NextFetchInit): Promise<T> {
  const response = await fetch(getApiUrl(path), init);

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as T;
}

export function getMenu(): Promise<MenuResponse> {
  return fetchApi<MenuResponse>("/api/menu", {
    method: "GET",
    next: { revalidate: 3600, tags: ["menu"] },
  });
}

export function getHomepageData(): Promise<HomepageResponse> {
  return fetchApi<HomepageResponse>("/api/homepage", {
    method: "GET",
    next: { revalidate: 60, tags: ["homepage"] },
  });
}

export function getCategoryArticles(
  slug: string,
  page = 1,
): Promise<CategoryArticlesResponse> {
  const safeSlug = encodeURIComponent(slug);
  const safePage = Number.isInteger(page) && page > 0 ? page : 1;

  return fetchApi<CategoryArticlesResponse>(
    `/api/categories/${safeSlug}/articles?page=${safePage}`,
    {
      method: "GET",
      next: { revalidate: 120, tags: [`category:${slug}`] },
    },
  );
}

export function getArticleDetail(
  slug: string,
): Promise<ArticleDetailResponse> {
  const safeSlug = encodeURIComponent(slug);

  return fetchApi<ArticleDetailResponse>(`/api/articles/${safeSlug}`, {
    method: "GET",
    next: { revalidate: 300, tags: [`article:${slug}`] },
  });
}

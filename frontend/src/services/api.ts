import type {
  ApiResponse,
  ArticleCommentsResponse,
  ArticleDetailResponse,
  ArticleSummary,
  AuthorArticlesResponse,
  CategoryArticlesResponse,
  HomepageResponse,
  MenuResponse,
  SearchResponse,
  TagArticlesResponse,
} from "@/types";

const API_URL = process.env.API_URL?.replace(/\/$/, "");
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type CacheOptions = {
  revalidate?: number | false;
  tags?: string[];
  cache?: RequestCache;
};

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code = "API_REQUEST_FAILED",
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

function apiUrl(path: string): string {
  if (!API_URL) throw new Error("Missing required server variable API_URL");
  return `${API_URL}${path}`;
}

function safeSlug(value: string): string {
  if (!SLUG_PATTERN.test(value)) throw new ApiRequestError("Slug không hợp lệ", 400);
  return encodeURIComponent(value);
}

function safePage(value: number): number {
  return Number.isInteger(value) && value > 0 ? value : 1;
}

async function fetchApi<T>(path: string, options: CacheOptions): Promise<T> {
  const response = await fetch(apiUrl(path), {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: options.cache,
    next:
      options.cache === "no-store"
        ? undefined
        : { revalidate: options.revalidate, tags: options.tags },
  });

  if (!response.ok) {
    let message = `API trả về lỗi ${response.status}`;
    let code = "API_REQUEST_FAILED";
    try {
      const body = (await response.json()) as ApiResponse<never>;
      if (!body.success) {
        message = body.error.message;
        code = body.error.code;
      }
    } catch {
      // Preserve the safe generic message for non-JSON upstream errors.
    }
    throw new ApiRequestError(message, response.status, code);
  }

  return (await response.json()) as T;
}

export const getMenu = () =>
  fetchApi<MenuResponse>("/menu", { revalidate: 3600, tags: ["menu"] });

export const getHomepageData = () =>
  fetchApi<HomepageResponse>("/homepage", {
    revalidate: 60,
    tags: ["homepage"],
  });

export function getCategoryArticles(slug: string, page = 1, limit = 12) {
  const normalized = safeSlug(slug);
  return fetchApi<CategoryArticlesResponse>(
    `/categories/${normalized}/articles?page=${safePage(page)}&limit=${Math.min(24, Math.max(1, limit))}`,
    { revalidate: 120, tags: [`category:${slug}`] },
  );
}

export function getArticleDetail(slug: string) {
  return fetchApi<ArticleDetailResponse>(`/articles/${safeSlug(slug)}`, {
    revalidate: 300,
    tags: [`article:${slug}`],
  });
}

export function getTagArticles(slug: string, page = 1) {
  return fetchApi<TagArticlesResponse>(
    `/tags/${safeSlug(slug)}/articles?page=${safePage(page)}&limit=12`,
    { revalidate: 120, tags: [`tag:${slug}`] },
  );
}

export function getAuthorArticles(slug: string, page = 1) {
  return fetchApi<AuthorArticlesResponse>(
    `/authors/${safeSlug(slug)}/articles?page=${safePage(page)}&limit=12`,
    { revalidate: 120, tags: [`author:${slug}`] },
  );
}

export function searchArticles(query: string, page = 1) {
  const normalized = query.trim().slice(0, 120);
  if (!normalized) {
    const empty: SearchResponse = {
      success: true,
      data: {
        query: "",
        items: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          total_pages: 0,
          has_next_page: false,
          has_previous_page: false,
        },
      },
    };
    return Promise.resolve(empty);
  }
  return fetchApi<SearchResponse>(
    `/search?q=${encodeURIComponent(normalized)}&page=${safePage(page)}&limit=12`,
    { cache: "no-store" },
  );
}

export function getTrendingArticles(period: "24h" | "7d" = "24h") {
  return fetchApi<ApiResponse<ArticleSummary[]>>(`/articles/trending?period=${period}`, {
    revalidate: 60,
    tags: ["trending"],
  });
}

export function getArticleComments(slug: string, page = 1) {
  return fetchApi<ArticleCommentsResponse>(
    `/articles/${safeSlug(slug)}/comments?page=${safePage(page)}&limit=20`,
    { cache: "no-store" },
  );
}

export function getSitemapArticles(page = 1) {
  return fetchApi<ApiResponse<{ items: ArticleSummary[]; has_more: boolean }>>(
    `/sitemap/articles?page=${safePage(page)}&limit=5000`,
    { revalidate: 3600, tags: ["sitemap"] },
  );
}

export function getPreviewArticle(token: string) {
  if (!/^[A-Za-z0-9._~-]{32,2048}$/.test(token)) {
    throw new ApiRequestError("Preview token không hợp lệ", 400);
  }
  return fetchApi<ArticleDetailResponse>(`/preview/articles/${encodeURIComponent(token)}`, {
    cache: "no-store",
  });
}

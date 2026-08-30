import type { Article, ArticleSummary } from "./article";
import type { CategoryDetail, CategoryTreeNode } from "./category";
import type { ApiResponse, PaginatedData } from "./common";
import type { Tag } from "./tag";

export type MenuResponse = ApiResponse<CategoryTreeNode[]>;
export type CategoryResponse = ApiResponse<CategoryDetail>;
export type ArticleListResponse = ApiResponse<PaginatedData<ArticleSummary>>;

export interface CategoryArticlesData
  extends PaginatedData<ArticleSummary> {
  category: CategoryDetail;
}

export type CategoryArticlesResponse = ApiResponse<CategoryArticlesData>;

export interface ArticleDetailData {
  article: Article;
  related_articles: ArticleSummary[];
}

export type ArticleDetailResponse = ApiResponse<ArticleDetailData>;

export interface TagArticlesData extends PaginatedData<ArticleSummary> {
  tag: Tag;
}

export type TagArticlesResponse = ApiResponse<TagArticlesData>;

export interface HomepageCategorySection {
  category: CategoryDetail;
  articles: ArticleSummary[];
}

export interface HomepageData {
  featured_articles: ArticleSummary[];
  trending_articles: ArticleSummary[];
  latest_articles: ArticleSummary[];
  category_sections: HomepageCategorySection[];
}

export type HomepageResponse = ApiResponse<HomepageData>;

export interface SearchData extends PaginatedData<ArticleSummary> {
  query: string;
}

export type SearchResponse = ApiResponse<SearchData>;

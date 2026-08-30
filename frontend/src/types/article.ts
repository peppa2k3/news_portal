import type { AuthorSummary } from "./author";
import type { CategorySummary } from "./category";
import type { EntityId, ISODateString } from "./common";
import type { Tag } from "./tag";

export const ARTICLE_STATUSES = [
  "draft",
  "in_review",
  "scheduled",
  "published",
  "archived",
] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export interface ArticleBase {
  id: EntityId;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  thumbnail_alt?: string | null;
  status: ArticleStatus;
  is_featured: boolean;
  is_trending?: boolean;
  view_count: EntityId;
  comment_count?: EntityId;
  published_at: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface ArticleSummary extends ArticleBase {
  category: CategorySummary;
  author: AuthorSummary | null;
  tags?: Tag[];
}

export interface Article extends ArticleSummary {
  content_html: string;
  meta_title: string | null;
  meta_desc: string | null;
  tags: Tag[];
  secondary_categories: CategorySummary[];
  canonical_url?: string | null;
  og_image_url?: string | null;
  scheduled_at?: ISODateString | null;
  version?: number;
}

export interface CreateArticleInput {
  title: string;
  slug: string;
  excerpt?: string | null;
  content_html: string;
  thumbnail_url?: string | null;
  thumbnail_media_id?: EntityId | null;
  category_id: EntityId;
  author_id?: EntityId | null;
  status?: ArticleStatus;
  is_featured?: boolean;
  is_trending?: boolean;
  featured_order?: number | null;
  published_at?: ISODateString | null;
  meta_title?: string | null;
  meta_desc?: string | null;
  tag_ids?: EntityId[];
  secondary_category_ids?: EntityId[];
  canonical_url?: string | null;
  scheduled_at?: ISODateString | null;
  version?: number;
}

export type UpdateArticleInput = Partial<CreateArticleInput>;

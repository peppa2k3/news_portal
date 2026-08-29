import type { EntityId, ISODateString } from "./common";

export interface Category {
  id: EntityId;
  name: string;
  slug: string;
  parent_id: EntityId | null;
  path: string | null;
  display_order: number;
  is_active: boolean;
  show_in_menu: boolean;
  meta_title: string | null;
  meta_desc: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export type CategorySummary = Pick<Category, "id" | "name" | "slug">;
export type CategoryBreadcrumbItem = CategorySummary;

export interface CategoryDetail extends Category {
  breadcrumb: CategoryBreadcrumbItem[];
  children: CategorySummary[];
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  parent_id?: EntityId | null;
  display_order?: number;
  is_active?: boolean;
  show_in_menu?: boolean;
  meta_title?: string | null;
  meta_desc?: string | null;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

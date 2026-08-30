import type { ArticleStatus } from "./article";
import type { EntityId, ISODateString, PaginatedData } from "./common";

export type UserRole = "super_admin" | "editor" | "author";
export type UserStatus = "active" | "suspended";

export interface User {
  id: EntityId;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  status: UserStatus;
  last_login_at: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface DashboardData {
  article_counts: Record<ArticleStatus, number>;
  pending_comments: number;
  recent_activity: AuditLog[];
}

export interface MediaAsset {
  id: EntityId;
  url: string;
  mime_type: string;
  size: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  created_at: ISODateString;
}

export type CommentStatus = "pending" | "approved" | "rejected" | "spam";

export interface Comment {
  id: EntityId;
  article_id: EntityId;
  article_title?: string;
  parent_id: EntityId | null;
  name: string;
  content: string;
  status: CommentStatus;
  created_at: ISODateString;
}

export interface AuditLog {
  id: EntityId;
  actor_name: string | null;
  action: string;
  entity_type: string;
  entity_id: EntityId | null;
  metadata: Record<string, unknown>;
  created_at: ISODateString;
}

export interface ArticleRevision {
  id: EntityId;
  article_id: EntityId;
  version: number;
  created_by_name: string | null;
  created_at: ISODateString;
}

export interface SiteSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  comments_enabled: boolean;
  maintenance_mode: boolean;
}

export type PaginatedUsers = PaginatedData<User>;

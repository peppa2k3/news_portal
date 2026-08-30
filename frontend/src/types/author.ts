import type { EntityId } from "./common";

export interface Author {
  id: EntityId;
  full_name: string | null;
  slug: string | null;
  avatar_url: string | null;
  bio: string | null;
  social_links?: Record<string, string>;
}

export type AuthorSummary = Pick<
  Author,
  "id" | "full_name" | "slug" | "avatar_url"
>;

export interface CreateAuthorInput {
  full_name?: string | null;
  slug?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
}

export type UpdateAuthorInput = Partial<CreateAuthorInput>;

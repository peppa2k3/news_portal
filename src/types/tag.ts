import type { EntityId } from "./common";

export interface Tag {
  id: EntityId;
  name: string;
  slug: string;
}

export interface CreateTagInput {
  name: string;
  slug: string;
}

export type UpdateTagInput = Partial<CreateTagInput>;

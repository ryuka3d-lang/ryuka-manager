import type { WorkspaceEntity } from "./base";

export interface Product extends WorkspaceEntity {
  name: string;
  category?: string;
  description?: string;
  wholesalePrice?: number;
  retailPrice?: number;
  active: boolean;
}

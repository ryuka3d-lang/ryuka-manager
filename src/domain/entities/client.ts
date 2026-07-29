import type { WorkspaceEntity } from "./base";

export interface Client extends WorkspaceEntity {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  active: boolean;
}

import type { Client } from "@/src/domain/entities/client";
import type { Repository } from "./repository";

export type CreateClientInput = Omit<Client, "id" | "workspaceId" | "createdAt" | "updatedAt">;
export type UpdateClientInput = Partial<CreateClientInput>;
export interface ClientRepository extends Repository<Client, CreateClientInput, UpdateClientInput> {}

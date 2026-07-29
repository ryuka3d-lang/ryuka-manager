import type { Product } from "@/src/domain/entities/product";
import type { Repository } from "./repository";

export type CreateProductInput = Omit<Product, "id" | "workspaceId" | "createdAt" | "updatedAt">;
export type UpdateProductInput = Partial<CreateProductInput>;
export interface ProductRepository extends Repository<Product, CreateProductInput, UpdateProductInput> {}

import type { ProductRepository, CreateProductInput, UpdateProductInput } from "@/src/domain/repositories/product-repository";
import { eventBus } from "@/src/events/event-bus";

export class ProductApplicationService {
  constructor(private readonly repository: ProductRepository) {}

  list(workspaceId: string) { return this.repository.list(workspaceId); }

  async create(input: CreateProductInput, workspaceId: string) {
    const product = await this.repository.create(input, workspaceId);
    await eventBus.emit("product.created", product);
    return product;
  }

  async update(id: string, input: UpdateProductInput, workspaceId: string) {
    const product = await this.repository.update(id, input, workspaceId);
    await eventBus.emit("product.updated", product);
    return product;
  }

  async remove(id: string, workspaceId: string) {
    await this.repository.remove(id, workspaceId);
    await eventBus.emit("product.removed", { id, workspaceId });
  }
}

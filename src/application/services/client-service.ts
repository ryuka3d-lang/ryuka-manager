import type { ClientRepository, CreateClientInput, UpdateClientInput } from "@/src/domain/repositories/client-repository";
import { eventBus } from "@/src/events/event-bus";

export class ClientApplicationService {
  constructor(private readonly repository: ClientRepository) {}
  list(workspaceId: string) { return this.repository.list(workspaceId); }
  async create(input: CreateClientInput, workspaceId: string) {
    const client = await this.repository.create(input, workspaceId);
    await eventBus.emit("client.created", client);
    return client;
  }
  async update(id: string, input: UpdateClientInput, workspaceId: string) {
    const client = await this.repository.update(id, input, workspaceId);
    await eventBus.emit("client.updated", client);
    return client;
  }
  async remove(id: string, workspaceId: string) {
    await this.repository.remove(id, workspaceId);
    await eventBus.emit("client.removed", { id, workspaceId });
  }
}

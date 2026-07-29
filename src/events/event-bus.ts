export interface DomainEvent<T = unknown> {
  type: string;
  payload: T;
  occurredAt: string;
}

type Handler<T = unknown> = (event: DomainEvent<T>) => void | Promise<void>;

class EventBus {
  private handlers = new Map<string, Set<Handler>>();

  on<T>(type: string, handler: Handler<T>): () => void {
    const handlers = this.handlers.get(type) ?? new Set<Handler>();
    handlers.add(handler as Handler);
    this.handlers.set(type, handlers);
    return () => handlers.delete(handler as Handler);
  }

  async emit<T>(type: string, payload: T): Promise<void> {
    const event: DomainEvent<T> = { type, payload, occurredAt: new Date().toISOString() };
    await Promise.all([...(this.handlers.get(type) ?? [])].map((handler) => handler(event)));
  }
}

export const eventBus = new EventBus();

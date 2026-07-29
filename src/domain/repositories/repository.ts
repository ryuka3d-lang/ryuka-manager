export interface Repository<T, CreateInput = Partial<T>, UpdateInput = Partial<T>> {
  list(workspaceId: string): Promise<T[]>;
  getById(id: string, workspaceId: string): Promise<T | null>;
  create(input: CreateInput, workspaceId: string): Promise<T>;
  update(id: string, input: UpdateInput, workspaceId: string): Promise<T>;
  remove(id: string, workspaceId: string): Promise<void>;
}

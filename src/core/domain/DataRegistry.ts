export class DataRegistry<T extends { id: string }> {
  private readonly items: Map<string, T> = new Map();

  constructor(initialData?: T[]) {
    if (initialData) {
      this.registerAll(initialData);
    }
  }

  public register(item: T): void {
    this.items.set(item.id, item);
  }

  public registerAll(items: T[]): void {
    for (const item of items) {
      this.register(item);
    }
  }

  public get(id: string): T | undefined {
    return this.items.get(id);
  }

  public getOrThrow(id: string): T {
    const item = this.items.get(id);
    if (!item) {
      throw new Error(`Entity with ID '${id}' not found in registry.`);
    }
    return item;
  }

  public getAll(): T[] {
    return Array.from(this.items.values());
  }

  public query(predicate: (item: T) => boolean): T[] {
    return this.getAll().filter(predicate);
  }

  public count(): number {
    return this.items.size;
  }

  public clear(): void {
    this.items.clear();
  }
}

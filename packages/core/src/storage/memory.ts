import type { Group } from '../types'
import { type BillRepository, clone } from './repository'

/** In-memory repository — handy for tests and SSR/no-storage environments. */
export class InMemoryRepository implements BillRepository {
  private store = new Map<string, Group>()

  constructor(seed: Group[] = []) {
    for (const g of seed) this.store.set(g.id, clone(g))
  }

  async listGroups(): Promise<Group[]> {
    return [...this.store.values()].map(clone)
  }

  async getGroup(id: string): Promise<Group | null> {
    const g = this.store.get(id)
    return g ? clone(g) : null
  }

  async saveGroup(group: Group): Promise<void> {
    this.store.set(group.id, clone(group))
  }

  async deleteGroup(id: string): Promise<void> {
    this.store.delete(id)
  }
}

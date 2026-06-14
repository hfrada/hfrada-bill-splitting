import type { Group } from '../types'
import { type BillRepository, clone } from './repository'

const DEFAULT_KEY = 'bill:groups'

/**
 * Minimal storage surface — `window.localStorage` satisfies this, and tests can
 * pass a fake. The whole group list is serialized under one key.
 */
export interface KeyValueStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

/** localStorage-backed repository. Reads/writes the full group list per call. */
export class LocalStorageRepository implements BillRepository {
  private store: KeyValueStore
  private key: string

  constructor(store?: KeyValueStore, key = DEFAULT_KEY) {
    const resolved = store ?? (typeof localStorage !== 'undefined' ? localStorage : undefined)
    if (!resolved) {
      throw new Error('LocalStorageRepository requires a KeyValueStore (no localStorage available)')
    }
    this.store = resolved
    this.key = key
  }

  private readAll(): Group[] {
    const raw = this.store.getItem(this.key)
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? (parsed as Group[]) : []
    } catch {
      return []
    }
  }

  private writeAll(groups: Group[]): void {
    this.store.setItem(this.key, JSON.stringify(groups))
  }

  async listGroups(): Promise<Group[]> {
    return this.readAll().map(clone)
  }

  async getGroup(id: string): Promise<Group | null> {
    const found = this.readAll().find((g) => g.id === id)
    return found ? clone(found) : null
  }

  async saveGroup(group: Group): Promise<void> {
    const groups = this.readAll()
    const idx = groups.findIndex((g) => g.id === group.id)
    if (idx >= 0) groups[idx] = clone(group)
    else groups.push(clone(group))
    this.writeAll(groups)
  }

  async deleteGroup(id: string): Promise<void> {
    this.writeAll(this.readAll().filter((g) => g.id !== id))
  }
}

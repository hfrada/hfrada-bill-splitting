import type { Group } from '../types'

/**
 * Storage-agnostic persistence boundary for groups (the aggregate root).
 *
 * All methods are async so the same interface works for a synchronous
 * localStorage adapter *and* a future SQL/HTTP adapter. Swap the implementation
 * without touching domain logic or UI data hooks.
 */
export interface BillRepository {
  listGroups(): Promise<Group[]>
  getGroup(id: string): Promise<Group | null>
  /** Insert or replace a group by id. */
  saveGroup(group: Group): Promise<void>
  deleteGroup(id: string): Promise<void>
}

/** Deep-clone helper so adapters never hand out references to their internals. */
export function clone<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value)
  return JSON.parse(JSON.stringify(value)) as T
}

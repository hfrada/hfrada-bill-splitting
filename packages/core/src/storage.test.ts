import { describe, it, expect } from 'vitest'
import { InMemoryRepository } from './storage/memory'
import { LocalStorageRepository, type KeyValueStore } from './storage/localStorage'
import { createGroup } from './operations'
import { IDR } from './types'

class FakeStore implements KeyValueStore {
  private map = new Map<string, string>()
  getItem(key: string) {
    return this.map.get(key) ?? null
  }
  setItem(key: string, value: string) {
    this.map.set(key, value)
  }
}

function runRepoContract(name: string, make: () => import('./storage/repository').BillRepository) {
  describe(name, () => {
    it('saves, lists, gets, and deletes groups', async () => {
      const repo = make()
      const g = createGroup({ id: 'g1', name: 'Kos', currency: IDR, members: ['A', 'B'] })

      await repo.saveGroup(g)
      expect(await repo.listGroups()).toHaveLength(1)
      expect((await repo.getGroup('g1'))?.name).toBe('Kos')

      await repo.deleteGroup('g1')
      expect(await repo.getGroup('g1')).toBeNull()
      expect(await repo.listGroups()).toHaveLength(0)
    })

    it('does not leak internal references', async () => {
      const repo = make()
      const g = createGroup({ id: 'g1', name: 'Trip', currency: IDR })
      await repo.saveGroup(g)
      const read = await repo.getGroup('g1')
      read!.name = 'Mutated'
      expect((await repo.getGroup('g1'))?.name).toBe('Trip')
    })
  })
}

runRepoContract('InMemoryRepository', () => new InMemoryRepository())
runRepoContract('LocalStorageRepository', () => new LocalStorageRepository(new FakeStore()))

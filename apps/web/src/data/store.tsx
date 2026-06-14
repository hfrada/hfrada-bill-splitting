'use client'

import * as React from 'react'
import {
  InMemoryRepository,
  LocalStorageRepository,
  type BillRepository,
  type Currency,
  type Group,
  createGroup as createGroupEntity,
} from '@bill/core'

interface BillStore {
  ready: boolean
  groups: Group[]
  getGroup: (id: string) => Group | undefined
  createGroup: (input: { name: string; currency: Currency; members?: string[] }) => Promise<Group>
  /** Persist a full (already-updated) group and refresh state. */
  saveGroup: (group: Group) => Promise<void>
  /** Apply an immutable update function to a group, then persist. */
  mutateGroup: (id: string, fn: (group: Group) => Group) => Promise<void>
  deleteGroup: (id: string) => Promise<void>
}

const BillStoreContext = React.createContext<BillStore | null>(null)

function makeRepository(): BillRepository {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    return new LocalStorageRepository()
  }
  // Server render / no storage — empty in-memory repo (client re-hydrates).
  return new InMemoryRepository()
}

export function BillStoreProvider({ children }: { children: React.ReactNode }) {
  const repoRef = React.useRef<BillRepository | null>(null)
  if (repoRef.current === null) repoRef.current = makeRepository()
  const repo = repoRef.current

  const [groups, setGroups] = React.useState<Group[]>([])
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    let active = true
    repo.listGroups().then((g) => {
      if (active) {
        setGroups(g)
        setReady(true)
      }
    })
    return () => {
      active = false
    }
  }, [repo])

  const value = React.useMemo<BillStore>(() => {
    const refresh = async () => setGroups(await repo.listGroups())
    return {
      ready,
      groups,
      getGroup: (id) => groups.find((g) => g.id === id),
      createGroup: async (input) => {
        const group = createGroupEntity(input)
        await repo.saveGroup(group)
        await refresh()
        return group
      },
      saveGroup: async (group) => {
        await repo.saveGroup(group)
        await refresh()
      },
      mutateGroup: async (id, fn) => {
        const current = await repo.getGroup(id)
        if (!current) return
        await repo.saveGroup(fn(current))
        await refresh()
      },
      deleteGroup: async (id) => {
        await repo.deleteGroup(id)
        await refresh()
      },
    }
  }, [repo, groups, ready])

  return <BillStoreContext.Provider value={value}>{children}</BillStoreContext.Provider>
}

export function useBillStore(): BillStore {
  const ctx = React.useContext(BillStoreContext)
  if (!ctx) throw new Error('useBillStore must be used within a BillStoreProvider')
  return ctx
}

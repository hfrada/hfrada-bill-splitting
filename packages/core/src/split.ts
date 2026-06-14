import type { SplitConfig } from './types'

/**
 * Allocate an integer `total` across weighted entries so the parts sum *exactly*
 * to `total`. Uses the largest-remainder method: floor each proportional share,
 * then hand the leftover minor units one-by-one to the entries with the biggest
 * fractional remainders (ties broken by input order, so results are stable).
 */
export function allocateByWeight(total: number, entries: { id: string; weight: number }[]): Record<string, number> {
  const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0)
  if (totalWeight <= 0) {
    throw new Error('Total weight must be greater than zero')
  }

  const result: Record<string, number> = {}
  const fracs: { id: string; frac: number; order: number }[] = []
  let allocated = 0

  entries.forEach((e, order) => {
    const exact = (total * e.weight) / totalWeight
    const floor = Math.floor(exact)
    result[e.id] = floor
    allocated += floor
    fracs.push({ id: e.id, frac: exact - floor, order })
  })

  let remainder = total - allocated
  const byFrac = [...fracs].sort((a, b) => b.frac - a.frac || a.order - b.order)
  for (let k = 0; remainder > 0 && k < byFrac.length; k++, remainder--) {
    result[byFrac[k].id] += 1
  }
  return result
}

/** Returns a human-readable validation error for the split, or `null` if valid. */
export function splitError(total: number, config: SplitConfig): string | null {
  const { mode, participants } = config
  if (participants.length === 0) return 'Pilih minimal satu peserta'
  if (total <= 0) return 'Total harus lebih dari nol'

  switch (mode) {
    case 'exact': {
      const amounts = config.amounts ?? {}
      const sum = participants.reduce((s, id) => s + (amounts[id] ?? 0), 0)
      if (participants.some((id) => (amounts[id] ?? 0) < 0)) return 'Jumlah tidak boleh negatif'
      if (sum !== total) return `Jumlah per orang harus tepat sama dengan total`
      return null
    }
    case 'shares': {
      const shares = config.shares ?? {}
      if (participants.every((id) => (shares[id] ?? 0) <= 0)) return 'Masukkan bobot share yang valid'
      if (participants.some((id) => (shares[id] ?? 0) < 0)) return 'Share tidak boleh negatif'
      return null
    }
    case 'percent': {
      const percents = config.percents ?? {}
      const sum = participants.reduce((s, id) => s + (percents[id] ?? 0), 0)
      if (Math.abs(sum - 100) > 1e-9) return 'Total persen harus 100%'
      return null
    }
    case 'equal':
      return null
    default:
      return 'Mode pembagian tidak dikenal'
  }
}

/**
 * Resolve a split config into the owed amount (minor units) per participant id.
 * The returned amounts always sum exactly to `total`. Throws on invalid input
 * (call {@link splitError} first to show friendly UI validation).
 */
export function computeSplit(total: number, config: SplitConfig): Record<string, number> {
  const err = splitError(total, config)
  if (err) throw new Error(err)

  const { mode, participants } = config

  switch (mode) {
    case 'equal':
      return allocateByWeight(
        total,
        participants.map((id) => ({ id, weight: 1 })),
      )
    case 'shares':
      return allocateByWeight(
        total,
        participants.map((id) => ({ id, weight: config.shares?.[id] ?? 0 })),
      )
    case 'percent':
      return allocateByWeight(
        total,
        participants.map((id) => ({ id, weight: config.percents?.[id] ?? 0 })),
      )
    case 'exact': {
      const amounts = config.amounts ?? {}
      const result: Record<string, number> = {}
      for (const id of participants) result[id] = amounts[id] ?? 0
      return result
    }
    default:
      throw new Error('Mode pembagian tidak dikenal')
  }
}

import { describe, it, expect } from 'vitest'
import { allocateByWeight, computeSplit, splitError } from './split'
import type { SplitConfig } from './types'

const sum = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0)

describe('allocateByWeight', () => {
  it('splits evenly when divisible', () => {
    const r = allocateByWeight(300, [
      { id: 'a', weight: 1 },
      { id: 'b', weight: 1 },
      { id: 'c', weight: 1 },
    ])
    expect(r).toEqual({ a: 100, b: 100, c: 100 })
  })

  it('distributes the remainder to the earliest entries (stable)', () => {
    const r = allocateByWeight(100, [
      { id: 'a', weight: 1 },
      { id: 'b', weight: 1 },
      { id: 'c', weight: 1 },
    ])
    // 100/3 -> 33,33,33 + 1 leftover to first
    expect(r).toEqual({ a: 34, b: 33, c: 33 })
    expect(sum(r)).toBe(100)
  })

  it('allocates proportionally by weight and still sums exactly', () => {
    const r = allocateByWeight(1000, [
      { id: 'a', weight: 1 },
      { id: 'b', weight: 3 },
    ])
    expect(r).toEqual({ a: 250, b: 750 })
  })

  it('throws when total weight is zero', () => {
    expect(() => allocateByWeight(100, [{ id: 'a', weight: 0 }])).toThrow()
  })
})

describe('computeSplit', () => {
  const participants = ['a', 'b', 'c']

  it('equal split always sums to total', () => {
    for (const total of [1, 2, 100, 101, 999, 1000]) {
      const r = computeSplit(total, { mode: 'equal', participants })
      expect(sum(r)).toBe(total)
    }
  })

  it('exact split returns the given amounts', () => {
    const config: SplitConfig = { mode: 'exact', participants, amounts: { a: 500, b: 300, c: 200 } }
    expect(computeSplit(1000, config)).toEqual({ a: 500, b: 300, c: 200 })
  })

  it('shares split is proportional and exact', () => {
    const config: SplitConfig = { mode: 'shares', participants, shares: { a: 2, b: 1, c: 1 } }
    const r = computeSplit(1000, config)
    expect(r).toEqual({ a: 500, b: 250, c: 250 })
    expect(sum(r)).toBe(1000)
  })

  it('percent split sums exactly even with rounding', () => {
    const config: SplitConfig = { mode: 'percent', participants, percents: { a: 33.33, b: 33.33, c: 33.34 } }
    const r = computeSplit(1000, config)
    expect(sum(r)).toBe(1000)
  })

  it('throws on invalid exact totals', () => {
    const config: SplitConfig = { mode: 'exact', participants, amounts: { a: 1, b: 1, c: 1 } }
    expect(() => computeSplit(1000, config)).toThrow()
  })
})

describe('splitError', () => {
  it('flags percent not summing to 100', () => {
    expect(splitError(1000, { mode: 'percent', participants: ['a', 'b'], percents: { a: 40, b: 40 } })).toMatch(/100/)
  })
  it('flags empty participants', () => {
    expect(splitError(1000, { mode: 'equal', participants: [] })).toBeTruthy()
  })
  it('passes a valid equal split', () => {
    expect(splitError(1000, { mode: 'equal', participants: ['a'] })).toBeNull()
  })
})

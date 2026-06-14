import { describe, it, expect } from 'vitest'
import { computeBalances } from './balances'
import { simplifyDebts } from './settle'
import { createExpense, createSettlement } from './operations'
import type { Member } from './types'

const members: Member[] = [
  { id: 'a', name: 'Andi' },
  { id: 'b', name: 'Budi' },
  { id: 'c', name: 'Citra' },
]

const netZero = (b: Record<string, number>) => Object.values(b).reduce((x, y) => x + y, 0)

describe('computeBalances', () => {
  it('credits payer and debits participants; nets to zero', () => {
    const e = createExpense({
      id: 'e1',
      description: 'Dinner',
      amount: 300,
      paidBy: 'a',
      split: { mode: 'equal', participants: ['a', 'b', 'c'] },
    })
    const b = computeBalances(members, [e], [])
    // a paid 300, owes 100 -> +200; b,c each -100
    expect(b).toEqual({ a: 200, b: -100, c: -100 })
    expect(netZero(b)).toBe(0)
  })

  it('settlements move balance from payer toward zero', () => {
    const e = createExpense({
      id: 'e1',
      description: 'Trip',
      amount: 300,
      paidBy: 'a',
      split: { mode: 'equal', participants: ['a', 'b', 'c'] },
    })
    const s = createSettlement({ id: 's1', from: 'b', to: 'a', amount: 100 })
    const b = computeBalances(members, [e], [s])
    expect(b).toEqual({ a: 100, b: 0, c: -100 })
    expect(netZero(b)).toBe(0)
  })
})

describe('simplifyDebts', () => {
  it('produces minimal transfers that clear all balances', () => {
    const balances = { a: 200, b: -100, c: -100 }
    const transfers = simplifyDebts(balances)
    expect(transfers).toHaveLength(2)
    // applying transfers should zero everyone out
    const after = { ...balances }
    for (const t of transfers) {
      after[t.from as keyof typeof after] += t.amount
      after[t.to as keyof typeof after] -= t.amount
    }
    expect(Object.values(after).every((v) => v === 0)).toBe(true)
  })

  it('returns nothing when already settled', () => {
    expect(simplifyDebts({ a: 0, b: 0 })).toEqual([])
  })

  it('matches largest debtor to largest creditor first', () => {
    const transfers = simplifyDebts({ a: 500, b: 300, c: -800 })
    expect(transfers).toContainEqual({ from: 'c', to: 'a', amount: 500 })
    expect(transfers).toContainEqual({ from: 'c', to: 'b', amount: 300 })
  })
})

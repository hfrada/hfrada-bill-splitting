import type { Transfer } from './types'

/**
 * Debt simplification (minimal cash flow). Given net balances per member, return
 * the smallest practical set of transfers that settles everyone, by repeatedly
 * matching the largest debtor with the largest creditor.
 *
 * Assumes balances are integers (minor units) that sum to zero. Members with a
 * zero balance are ignored.
 */
export function simplifyDebts(balances: Record<string, number>): Transfer[] {
  const debtors: { id: string; amount: number }[] = []
  const creditors: { id: string; amount: number }[] = []

  for (const [id, balance] of Object.entries(balances)) {
    if (balance < 0) debtors.push({ id, amount: -balance })
    else if (balance > 0) creditors.push({ id, amount: balance })
  }

  // Largest first, ties broken by id for deterministic output.
  debtors.sort((a, b) => b.amount - a.amount || a.id.localeCompare(b.id))
  creditors.sort((a, b) => b.amount - a.amount || a.id.localeCompare(b.id))

  const transfers: Transfer[] = []
  let i = 0
  let j = 0
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]
    const amount = Math.min(debtor.amount, creditor.amount)

    if (amount > 0) {
      transfers.push({ from: debtor.id, to: creditor.id, amount })
      debtor.amount -= amount
      creditor.amount -= amount
    }

    if (debtor.amount === 0) i++
    if (creditor.amount === 0) j++
  }

  return transfers
}

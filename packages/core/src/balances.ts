import type { Expense, Group, Member, Settlement } from './types'

/**
 * Net balance per member id (minor units):
 *   positive → others owe this member (creditor)
 *   negative → this member owes others (debtor)
 *
 * Each expense credits the payer its full amount and debits every participant
 * their share. Each settlement credits the sender (they paid down their debt)
 * and debits the receiver. The grand total always nets to zero.
 */
export function computeBalances(
  members: Member[],
  expenses: Expense[],
  settlements: Settlement[],
): Record<string, number> {
  const balances: Record<string, number> = {}
  for (const m of members) balances[m.id] = 0

  for (const expense of expenses) {
    balances[expense.paidBy] = (balances[expense.paidBy] ?? 0) + expense.amount
    for (const [memberId, owed] of Object.entries(expense.shares)) {
      balances[memberId] = (balances[memberId] ?? 0) - owed
    }
  }

  for (const s of settlements) {
    balances[s.from] = (balances[s.from] ?? 0) + s.amount
    balances[s.to] = (balances[s.to] ?? 0) - s.amount
  }

  return balances
}

/** Convenience wrapper over a whole group. */
export function groupBalances(group: Group): Record<string, number> {
  return computeBalances(group.members, group.expenses, group.settlements)
}

/** Total spent (sum of expense amounts) in a group. */
export function totalSpent(group: Group): number {
  return group.expenses.reduce((sum, e) => sum + e.amount, 0)
}

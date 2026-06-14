import { computeSplit } from './split'
import type { Currency, Expense, Group, Member, Settlement, SplitConfig } from './types'

/** Default id generator (overridable for tests/determinism). */
export function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  // Fallback for environments without crypto.randomUUID.
  return 'id-' + Math.abs(Date.now() ^ Math.floor(Math.random() * 1e9)).toString(36)
}

export interface CreateGroupInput {
  name: string
  currency: Currency
  members?: string[]
  now?: string
  id?: string
}

export function createGroup(input: CreateGroupInput): Group {
  return {
    id: input.id ?? genId(),
    name: input.name.trim(),
    currency: input.currency,
    members: (input.members ?? []).map((name) => ({ id: genId(), name: name.trim() })),
    expenses: [],
    settlements: [],
    createdAt: input.now ?? new Date().toISOString(),
  }
}

export interface CreateExpenseInput {
  description: string
  /** Total in minor units. */
  amount: number
  paidBy: string
  split: SplitConfig
  date?: string
  category?: string
  id?: string
}

/** Build an Expense, snapshotting the resolved per-member shares. */
export function createExpense(input: CreateExpenseInput): Expense {
  return {
    id: input.id ?? genId(),
    description: input.description.trim(),
    amount: input.amount,
    paidBy: input.paidBy,
    split: input.split,
    shares: computeSplit(input.amount, input.split),
    date: input.date ?? new Date().toISOString(),
    category: input.category,
  }
}

export interface CreateSettlementInput {
  from: string
  to: string
  amount: number
  date?: string
  note?: string
  id?: string
}

export function createSettlement(input: CreateSettlementInput): Settlement {
  return {
    id: input.id ?? genId(),
    from: input.from,
    to: input.to,
    amount: input.amount,
    date: input.date ?? new Date().toISOString(),
    note: input.note,
  }
}

// --- Immutable group updates ---------------------------------------------

export function addMember(group: Group, name: string): Group {
  const member: Member = { id: genId(), name: name.trim() }
  return { ...group, members: [...group.members, member] }
}

export function addExpense(group: Group, expense: Expense): Group {
  return { ...group, expenses: [...group.expenses, expense] }
}

export function updateExpense(group: Group, expense: Expense): Group {
  return { ...group, expenses: group.expenses.map((e) => (e.id === expense.id ? expense : e)) }
}

export function removeExpense(group: Group, expenseId: string): Group {
  return { ...group, expenses: group.expenses.filter((e) => e.id !== expenseId) }
}

export function addSettlement(group: Group, settlement: Settlement): Group {
  return { ...group, settlements: [...group.settlements, settlement] }
}

export function removeSettlement(group: Group, settlementId: string): Group {
  return { ...group, settlements: group.settlements.filter((s) => s.id !== settlementId) }
}

/**
 * Domain types for the bill-splitting core.
 *
 * Money convention: every amount is an **integer in minor units** (e.g. cents).
 * The `Currency.decimals` field says how many minor units make one major unit
 * (IDR = 0, USD/EUR = 2). Keeping money as integers avoids floating-point
 * rounding bugs when splitting.
 */

export interface Currency {
  /** ISO 4217-ish code, e.g. "IDR", "USD". */
  code: string
  /** Number of decimal places (minor units per major unit = 10 ** decimals). */
  decimals: number
  /** Default increment (in major units) for amount inputs. IDR = 1000, USD = 1. */
  step?: number
}

export interface Member {
  id: string
  name: string
}

/** How an expense's total is divided among its participants. */
export type SplitMode = 'equal' | 'exact' | 'shares' | 'percent'

/**
 * The raw split configuration the user picked. `computeSplit` turns this into a
 * resolved per-member owed map. The maps below are keyed by member id and only
 * read for their relevant mode.
 */
export interface SplitConfig {
  mode: SplitMode
  /** Members sharing this expense (the order is used for remainder fairness). */
  participants: string[]
  /** exact: explicit owed amount per member (minor units); must sum to total. */
  amounts?: Record<string, number>
  /** shares: positive weight per member. */
  shares?: Record<string, number>
  /** percent: 0..100 per member; must sum to 100. */
  percents?: Record<string, number>
}

export interface Expense {
  id: string
  description: string
  /** Total amount in minor units (> 0). */
  amount: number
  /** Member id who paid. */
  paidBy: string
  /** The split configuration chosen by the user. */
  split: SplitConfig
  /**
   * Resolved owed amount per member id, summing exactly to `amount`. Snapshotted
   * at creation so balances stay stable even if split logic later changes.
   */
  shares: Record<string, number>
  /** ISO date string. */
  date: string
  category?: string
}

/** A direct payment from one member to another to settle debts. */
export interface Settlement {
  id: string
  from: string
  to: string
  /** Amount in minor units (> 0). */
  amount: number
  date: string
  note?: string
}

/** Aggregate root persisted as a unit. */
export interface Group {
  id: string
  name: string
  currency: Currency
  members: Member[]
  expenses: Expense[]
  settlements: Settlement[]
  createdAt: string
}

/** A suggested transfer produced by debt simplification. */
export interface Transfer {
  from: string
  to: string
  amount: number
}

export const IDR: Currency = { code: 'IDR', decimals: 0, step: 1000 }
export const USD: Currency = { code: 'USD', decimals: 2, step: 1 }

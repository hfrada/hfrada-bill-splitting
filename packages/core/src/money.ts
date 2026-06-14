import type { Currency } from './types'

/** Minor units in one major unit (e.g. 100 for USD, 1 for IDR). */
export function minorPerMajor(currency: Currency): number {
  return 10 ** currency.decimals
}

/** Parse a user-entered major-unit string (e.g. "12.50", "300000") to minor units. */
export function toMinor(major: string | number, currency: Currency): number {
  const value = typeof major === 'number' ? major : Number(String(major).replace(/[^\d.-]/g, ''))
  if (!Number.isFinite(value)) return 0
  return Math.round(value * minorPerMajor(currency))
}

/** Convert minor units back to a major-unit number (may be fractional). */
export function toMajor(minor: number, currency: Currency): number {
  return minor / minorPerMajor(currency)
}

/** Format minor units as a localized currency string. */
export function formatMoney(minor: number, currency: Currency, locale = 'id-ID'): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals,
    }).format(toMajor(minor, currency))
  } catch {
    // Unknown currency code — fall back to a plain number with the code.
    return `${toMajor(minor, currency).toFixed(currency.decimals)} ${currency.code}`
  }
}

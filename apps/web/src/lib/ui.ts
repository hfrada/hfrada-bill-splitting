import type { ColorScheme } from '@bill/ui'

const PALETTE: ColorScheme[] = ['primary', 'accent', 'info', 'warning', 'success', 'danger', 'secondary']

/** Deterministic avatar/accent color from a stable id. */
export function colorFor(id: string): ColorScheme {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

/**
 * Soft chip classes per color. Written as full literal strings so Tailwind's
 * content scanner keeps them (dynamic `bg-${color}` would be purged).
 */
const SOFT_CHIP: Record<ColorScheme, string> = {
  primary: 'bg-primary-500/10 text-primary-600',
  secondary: 'bg-secondary-500/10 text-secondary-600',
  accent: 'bg-accent-500/10 text-accent-600',
  neutral: 'bg-neutral-500/10 text-neutral-600',
  info: 'bg-info-500/10 text-info-600',
  warning: 'bg-warning-500/10 text-warning-600',
  success: 'bg-success-500/10 text-success-600',
  danger: 'bg-danger-500/10 text-danger-600',
}

export function softChip(color: ColorScheme): string {
  return SOFT_CHIP[color]
}

/**
 * Opaque avatar fill for dark mode. purbio's default uses `dark:bg-{c}-500/20`
 * (translucent), which lets overlapping avatars show through — force a solid fill.
 * Literal strings so Tailwind keeps them.
 */
const AVATAR_SOLID: Record<ColorScheme, string> = {
  primary: 'dark:bg-primary-600 dark:text-white',
  secondary: 'dark:bg-secondary-600 dark:text-white',
  accent: 'dark:bg-accent-600 dark:text-white',
  neutral: 'dark:bg-neutral-600 dark:text-white',
  info: 'dark:bg-info-600 dark:text-white',
  warning: 'dark:bg-warning-600 dark:text-white',
  success: 'dark:bg-success-600 dark:text-white',
  danger: 'dark:bg-danger-600 dark:text-white',
}

export function avatarSolid(color: ColorScheme): string {
  return AVATAR_SOLID[color]
}

import * as React from 'react'
import { ThemeProvider, presets, type ThemeConfig, type GlobalConfig } from 'purbio-react-ui'

/**
 * Brand theme for the bill-splitting app. Built on purbio's `emerald` preset
 * with a slightly rounder radius. Tweak colors/fonts/radius here once and the
 * whole app re-themes at runtime (no rebuild).
 */
export const billTheme: ThemeConfig = {
  ...presets.pill,
  radius: '0.75rem',
  fonts: {
    sans: 'var(--font-sans-app), Inter, system-ui, sans-serif',
    display: 'var(--font-display-app), var(--font-sans-app), system-ui, sans-serif',
  },
  // Cohesive slate surfaces so bg / card / border harmonize in both modes.
  surfaces: {
    bg: '#f1f5f9', // slate-100
    surface: '#ffffff', // white card pops on slate bg
    'surface-elevated': '#ffffff',
    border: '#e2e8f0', // slate-200
    fg: '#0f172a', // slate-900
    'fg-muted': '#64748b', // slate-500
    'fg-subtle': '#94a3b8', // slate-400
  },
  darkSurfaces: {
    bg: '#020617', // slate-950
    surface: '#0f172a', // slate-900
    'surface-elevated': '#1e293b', // slate-800
    border: '#1e293b', // slate-800
    fg: '#f1f5f9', // slate-100
    'fg-muted': '#94a3b8', // slate-400
    'fg-subtle': '#64748b', // slate-500
  },
}

/** Global default size/variant for components across the app. */
export const billConfig: GlobalConfig = {
  size: 'md',
  components: {
    Button: { variant: 'solid' },
  },
}

export interface AppThemeProviderProps {
  children: React.ReactNode
  defaultMode?: 'light' | 'dark' | 'system'
}

/**
 * Pre-configured ThemeProvider for the app. Wrap your root once.
 * Re-exports purbio's runtime theming with the bill-splitting brand baked in.
 */
export function AppThemeProvider({ children, defaultMode = 'system' }: AppThemeProviderProps) {
  return (
    <ThemeProvider theme={billTheme} config={billConfig} defaultMode={defaultMode}>
      {children}
    </ThemeProvider>
  )
}

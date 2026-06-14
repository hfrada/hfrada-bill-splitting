'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { IconButton, useTheme } from '@bill/ui'

export function ThemeToggle() {
  const { resolvedMode, toggleMode } = useTheme()
  // The server can't know the OS color scheme, so it renders the light-mode icon.
  // Match that on the first client render, then swap after mount to avoid a
  // hydration mismatch when the OS prefers dark.
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  const isDark = mounted && resolvedMode === 'dark'

  return (
    <IconButton
      variant="ghost"
      color="neutral"
      size="sm"
      aria-label="Ganti tema terang/gelap"
      onClick={toggleMode}
      icon={isDark ? <Sun size={18} /> : <Moon size={18} />}
    />
  )
}

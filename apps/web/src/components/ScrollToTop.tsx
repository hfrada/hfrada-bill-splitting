'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/** Scrolls the window back to the top whenever the route (pathname) changes. */
export function ScrollToTop() {
  const pathname = usePathname()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

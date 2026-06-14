'use client'

import * as React from 'react'
import { cn } from '@bill/ui'

/**
 * Floating, sticky bottom action bar (mobile-modern). Icon-only actions live
 * inside; the wrapper is click-through except for the bar itself.
 *
 * `bare` drops the card background/border (for a single floating FAB).
 */
export function BottomBar({ children, bare = false }: { children: React.ReactNode; bare?: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto w-full max-w-3xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div
          className={cn(
            'pointer-events-auto flex items-center justify-center gap-2',
            !bare &&
              'rounded-2xl border border-border bg-surface/90 px-3 py-2.5 text-fg shadow-lg backdrop-blur supports-[backdrop-filter]:bg-surface/75',
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

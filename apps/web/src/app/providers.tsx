'use client'

import * as React from 'react'
import { AppThemeProvider } from '@bill/ui'
import { BillStoreProvider } from '@/data/store'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppThemeProvider defaultMode="system">
      <BillStoreProvider>{children}</BillStoreProvider>
    </AppThemeProvider>
  )
}

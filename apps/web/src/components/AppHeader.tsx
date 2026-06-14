'use client'

import Link from 'next/link'
import { Wallet } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-600 text-white shadow-sm">
            <Wallet size={17} strokeWidth={2.4} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">Patungan</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}

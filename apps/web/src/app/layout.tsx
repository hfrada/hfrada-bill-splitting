import type { Metadata } from 'next'
import { Inter, Manrope } from 'next/font/google'
import { Providers } from './providers'
import { AppHeader } from '@/components/AppHeader'
import { ScrollToTop } from '@/components/ScrollToTop'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans-app',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display-app',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Patungan — bagi tagihan jadi gampang',
  description: 'Kelola grup, catat pengeluaran, dan lihat siapa berutang ke siapa.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${manrope.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-bg text-fg antialiased">
        <Providers>
          <ScrollToTop />
          <AppHeader />
          <div className="mx-auto w-full max-w-3xl px-4 pb-28 pt-8 md:pt-10">{children}</div>
        </Providers>
      </body>
    </html>
  )
}

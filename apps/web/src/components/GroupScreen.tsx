'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Badge,
  Card,
  Heading,
  IconButton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@bill/ui'
import { formatMoney, totalSpent } from '@bill/core'
import { ArrowLeftRight, ChevronLeft, Home, Plus, Receipt, UserPlus, Users, Wallet } from 'lucide-react'
import { useBillStore } from '@/data/store'
import { ExpensesTab } from './ExpensesTab'
import { BalancesPanel } from './BalancesPanel'
import { AddMemberDialog } from './AddMemberDialog'
import { AddExpenseDialog } from './AddExpenseDialog'
import { BottomBar } from './BottomBar'

export function GroupScreen({ id }: { id: string }) {
  const { ready, getGroup } = useBillStore()
  const router = useRouter()
  const group = getGroup(id)
  const [memberOpen, setMemberOpen] = React.useState(false)
  const [expenseOpen, setExpenseOpen] = React.useState(false)

  if (!ready) {
    return <Text tone="muted">Memuat…</Text>
  }

  if (!group) {
    return (
      <div className="flex flex-col items-start gap-4 py-10">
        <Heading level={3}>Grup tidak ditemukan</Heading>
        <Link
          href="/"
          className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-4 text-sm font-medium text-fg-muted shadow-sm transition-all hover:text-fg hover:shadow"
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-neutral-500/10 transition-transform group-hover:-translate-x-0.5">
            <ChevronLeft size={15} />
          </span>
          Kembali ke daftar grup
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link
        href="/"
        className="group mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-4 text-sm font-medium text-fg-muted shadow-sm transition-all hover:text-fg hover:shadow"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-neutral-500/10 transition-transform group-hover:-translate-x-0.5">
          <ChevronLeft size={15} />
        </span>
        Semua grup
      </Link>

      <div className="mb-6 flex items-center gap-2">
        <Heading level={2} className="text-2xl">
          {group.name}
        </Heading>
        <Badge variant="soft" color="neutral">
          {group.currency.code}
        </Badge>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard
          icon={<Wallet size={18} />}
          color="primary"
          label="Total pengeluaran"
          value={formatMoney(totalSpent(group), group.currency)}
        />
        <StatCard
          icon={<Receipt size={18} />}
          color="info"
          label="Pengeluaran"
          value={String(group.expenses.length)}
        />
        <StatCard
          icon={<Users size={18} />}
          color="accent"
          label="Anggota"
          value={String(group.members.length)}
        />
      </div>

      <Tabs defaultValue="expenses" variant="pill" fullWidth>
        <TabList>
          <Tab value="expenses">
            <Receipt size={15} className="mr-1.5" /> Pengeluaran
          </Tab>
          <Tab value="balances">
            <ArrowLeftRight size={15} className="mr-1.5" /> Saldo &amp; Pelunasan
          </Tab>
        </TabList>
        <TabPanels className="pt-5">
          <TabPanel value="expenses">
            <ExpensesTab group={group} />
          </TabPanel>
          <TabPanel value="balances">
            <BalancesPanel group={group} />
          </TabPanel>
        </TabPanels>
      </Tabs>

      <AddMemberDialog group={group} open={memberOpen} onOpenChange={setMemberOpen} />
      <AddExpenseDialog group={group} open={expenseOpen} onOpenChange={setExpenseOpen} />

      <BottomBar>
        <IconButton
          variant="soft"
          color="neutral"
          size="lg"
          radius="full"
          aria-label="Beranda"
          icon={<Home size={20} />}
          onClick={() => router.push('/')}
        />
        <IconButton
          variant="ghost"
          color="neutral"
          size="lg"
          radius="full"
          aria-label="Tambah anggota"
          icon={<UserPlus size={20} />}
          onClick={() => setMemberOpen(true)}
        />
        <IconButton
          color="primary"
          size="lg"
          radius="full"
          aria-label="Tambah pengeluaran"
          icon={<Plus size={22} />}
          onClick={() => setExpenseOpen(true)}
          disabled={group.members.length === 0}
        />
      </BottomBar>
    </div>
  )
}

function StatCard({
  icon,
  color,
  label,
  value,
  action,
}: {
  icon: React.ReactNode
  color: 'primary' | 'info' | 'accent'
  label: string
  value: string
  action?: React.ReactNode
}) {
  const chip =
    color === 'primary'
      ? 'bg-primary-500/10 text-primary-600'
      : color === 'info'
        ? 'bg-info-500/10 text-info-600'
        : 'bg-accent-500/10 text-accent-600'
  return (
    <Card variant="outline" className="p-4">
      <div className="flex items-center justify-between">
        <span className={`grid h-9 w-9 place-items-center rounded-lg ${chip}`}>{icon}</span>
        {action}
      </div>
      <Text tone="subtle" className="mt-3 block text-xs">
        {label}
      </Text>
      <div className="mt-0.5 text-lg font-semibold tabular-nums">{value}</div>
    </Card>
  )
}

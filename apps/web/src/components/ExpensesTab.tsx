'use client'

import * as React from 'react'
import { AlertDialog, Card, Text } from '@bill/ui'
import { formatMoney, removeExpense, type Expense, type Group } from '@bill/core'
import { Receipt, Trash2 } from 'lucide-react'
import { useBillStore } from '@/data/store'
import { formatDate } from '@/lib/format'
import { colorFor, softChip } from '@/lib/ui'

const MODE_LABEL: Record<string, string> = {
  equal: 'Rata',
  exact: 'Fix',
  shares: 'Rasio',
  percent: 'Persen',
}

export function ExpensesTab({ group }: { group: Group }) {
  const { mutateGroup } = useBillStore()
  const [toDelete, setToDelete] = React.useState<Expense | null>(null)

  const memberName = (id: string) => group.members.find((m) => m.id === id)?.name ?? '?'
  const expenses = [...group.expenses].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div>
      <div className="mb-4">
        <Text className="font-semibold">{expenses.length} pengeluaran</Text>
      </div>

      {group.members.length === 0 ? (
        <EmptyCard title="Tambah anggota dulu" desc="Pengeluaran butuh minimal satu anggota." />
      ) : expenses.length === 0 ? (
        <EmptyCard title="Belum ada pengeluaran" desc="Catat pengeluaran pertama grup ini." />
      ) : (
        <div className="flex flex-col gap-1.5">
          {expenses.map((e) => (
            <Card key={e.id} variant="outline" hoverable className="group flex flex-row items-center gap-3 p-2.5">
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-lg ${softChip(colorFor(e.id))}`}
              >
                <Receipt size={16} />
              </span>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold leading-tight">{e.description || '(Tanpa nama)'}</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-fg-muted">
                  <span className="truncate">{memberName(e.paidBy)}</span>
                  <span className="text-fg-subtle">·</span>
                  <span className="shrink-0">{formatDate(e.date)}</span>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-sm font-bold leading-tight tabular-nums">{formatMoney(e.amount, group.currency)}</div>
                <div className="text-xs text-fg-subtle">
                  {MODE_LABEL[e.split.mode] ?? e.split.mode} · {e.split.participants.length} org
                </div>
              </div>

              <button
                type="button"
                aria-label="Hapus pengeluaran"
                className="-mr-1 grid size-7 shrink-0 place-items-center rounded-md text-fg-subtle opacity-0 transition hover:bg-danger-500/10 hover:text-danger-600 focus-visible:opacity-100 group-hover:opacity-100"
                onClick={() => setToDelete(e)}
              >
                <Trash2 size={15} />
              </button>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        tone="danger"
        title="Hapus pengeluaran?"
        description={
          toDelete
            ? `"${toDelete.description || 'Tanpa nama'}" (${formatMoney(toDelete.amount, group.currency)}) akan dihapus permanen.`
            : ''
        }
        confirmLabel="Hapus"
        cancelLabel="Batal"
        autoLoading
        onConfirm={async () => {
          if (toDelete) await mutateGroup(group.id, (g) => removeExpense(g, toDelete.id))
          setToDelete(null)
        }}
      />
    </div>
  )
}

function EmptyCard({ title, desc }: { title: string; desc: string }) {
  return (
    <Card variant="soft" className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-neutral-500/10 text-fg-muted">
        <Receipt size={22} />
      </span>
      <div>
        <div className="font-semibold">{title}</div>
        <Text tone="muted" className="mt-0.5 block text-sm">
          {desc}
        </Text>
      </div>
    </Card>
  )
}

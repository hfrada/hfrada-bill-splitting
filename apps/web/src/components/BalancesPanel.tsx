'use client'

import * as React from 'react'
import { AlertDialog, Avatar, Button, Card, Text } from '@bill/ui'
import {
  addSettlement,
  createSettlement,
  formatMoney,
  groupBalances,
  removeSettlement,
  simplifyDebts,
  type Group,
  type Settlement,
  type Transfer,
} from '@bill/core'
import { ArrowRight, Check, CheckCircle2, Handshake, Trash2 } from 'lucide-react'
import { useBillStore } from '@/data/store'
import { formatDate } from '@/lib/format'
import { colorFor } from '@/lib/ui'

export function BalancesPanel({ group }: { group: Group }) {
  const { mutateGroup } = useBillStore()
  const { currency } = group
  const memberName = (id: string) => group.members.find((m) => m.id === id)?.name ?? '?'

  const [settleTarget, setSettleTarget] = React.useState<Transfer | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Settlement | null>(null)

  const balances = groupBalances(group)
  const transfers = simplifyDebts(balances)
  const maxAbs = Math.max(1, ...group.members.map((m) => Math.abs(balances[m.id] ?? 0)))

  if (group.members.length === 0) {
    return (
      <Card variant="soft" className="px-6 py-12 text-center">
        <Text tone="muted">Tambah anggota untuk melihat saldo.</Text>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-7">
      {/* Per-member balances */}
      <section>
        <Text className="mb-3 block font-semibold">Saldo per anggota</Text>
        <div className="flex flex-col gap-2.5">
          {group.members.map((m) => {
            const b = balances[m.id] ?? 0
            const positive = b > 0
            const negative = b < 0
            const tone = positive ? 'text-success-600' : negative ? 'text-danger-600' : 'text-fg-muted'
            const bar = positive ? 'bg-success-500' : negative ? 'bg-danger-500' : 'bg-neutral-400'
            const label = positive ? 'akan menerima' : negative ? 'harus membayar' : 'lunas'
            const pct = Math.round((Math.abs(b) / maxAbs) * 100)
            return (
              <div key={m.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar size="sm" name={m.name} color={colorFor(m.id)} />
                    <div>
                      <div className="font-medium leading-tight">{m.name}</div>
                      <Text tone="subtle" className="text-xs">
                        {label}
                      </Text>
                    </div>
                  </div>
                  <span className={`font-semibold tabular-nums ${tone}`}>{formatMoney(Math.abs(b), currency)}</span>
                </div>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-neutral-500/10">
                  <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Settle-up suggestions */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Handshake size={17} className="text-fg-muted" />
          <Text className="font-semibold">Saran pelunasan</Text>
        </div>
        {transfers.length === 0 ? (
          <Card variant="soft" className="flex flex-row items-center gap-2 p-4">
            <CheckCircle2 size={18} className="text-success-600" />
            <Text className="text-sm font-medium text-success-600">Semua sudah lunas. 🎉</Text>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {transfers.map((t, i) => (
              <Card key={i} variant="outline" className="flex flex-row items-center gap-3 p-3">
                <Avatar size="sm" name={memberName(t.from)} color={colorFor(t.from)} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-sm">
                    <span className="truncate font-semibold">{memberName(t.from)}</span>
                    <ArrowRight size={14} className="shrink-0 text-fg-subtle" />
                    <span className="truncate font-semibold">{memberName(t.to)}</span>
                  </div>
                  <Text tone="subtle" className="text-xs">
                    {formatMoney(t.amount, currency)}
                  </Text>
                </div>
                <Button
                  size="sm"
                  color="success"
                  variant="solid"
                  startIcon={<Check size={15} />}
                  onClick={() => setSettleTarget(t)}
                >
                  Lunasi
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Recorded settlements */}
      {group.settlements.length > 0 && (
        <section>
          <Text className="mb-3 block font-semibold">Riwayat pelunasan</Text>
          <div className="flex flex-col gap-2">
            {group.settlements.map((s) => (
              <div
                key={s.id}
                className="group flex items-center justify-between rounded-xl border border-border px-3 py-2.5 text-sm"
              >
                <div className="flex items-center gap-2 text-fg-muted">
                  <span className="font-medium text-fg">{memberName(s.from)}</span>
                  <ArrowRight size={14} className="text-fg-subtle" />
                  <span className="font-medium text-fg">{memberName(s.to)}</span>
                  <span className="text-fg-subtle">· {formatDate(s.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium tabular-nums">{formatMoney(s.amount, currency)}</span>
                  <button
                    type="button"
                    aria-label="Hapus pelunasan"
                    className="ml-1 grid h-7 w-7 place-items-center rounded-md text-fg-subtle opacity-0 transition hover:bg-danger-500/10 hover:text-danger-600 group-hover:opacity-100"
                    onClick={() => setDeleteTarget(s)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Confirm: record settlement */}
      <AlertDialog
        open={!!settleTarget}
        onOpenChange={(open) => !open && setSettleTarget(null)}
        tone="success"
        title="Catat pelunasan?"
        description={
          settleTarget
            ? `${memberName(settleTarget.from)} membayar ${memberName(settleTarget.to)} sebesar ${formatMoney(settleTarget.amount, currency)}.`
            : ''
        }
        confirmLabel="Lunasi"
        cancelLabel="Batal"
        autoLoading
        onConfirm={async () => {
          if (settleTarget) {
            const t = settleTarget
            await mutateGroup(group.id, (g) =>
              addSettlement(g, createSettlement({ from: t.from, to: t.to, amount: t.amount })),
            )
          }
          setSettleTarget(null)
        }}
      />

      {/* Confirm: delete settlement */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        tone="danger"
        title="Hapus pelunasan?"
        description={
          deleteTarget
            ? `Pelunasan ${memberName(deleteTarget.from)} → ${memberName(deleteTarget.to)} (${formatMoney(deleteTarget.amount, currency)}) akan dihapus.`
            : ''
        }
        confirmLabel="Hapus"
        cancelLabel="Batal"
        autoLoading
        onConfirm={async () => {
          if (deleteTarget) await mutateGroup(group.id, (g) => removeSettlement(g, deleteTarget.id))
          setDeleteTarget(null)
        }}
      />
    </div>
  )
}

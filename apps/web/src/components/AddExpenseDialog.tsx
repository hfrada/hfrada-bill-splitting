'use client'

import * as React from 'react'
import {
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
  NumberInput,
  SegmentedControl,
  Select,
  Text,
} from '@bill/ui'
import {
  addExpense,
  computeSplit,
  createExpense,
  formatMoney,
  splitError,
  toMajor,
  toMinor,
  type Group,
  type SplitConfig,
  type SplitMode,
} from '@bill/core'
import { useBillStore } from '@/data/store'

const MODE_OPTIONS = [
  { value: 'equal', label: 'Rata' },
  { value: 'exact', label: 'Fix' },
  { value: 'shares', label: 'Rasio' },
  { value: 'percent', label: 'Persen' },
]

export function AddExpenseDialog({
  group,
  open,
  onOpenChange,
}: {
  group: Group
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { mutateGroup } = useBillStore()
  const { currency, members } = group
  // Fallback keeps older groups (saved before `step` existed) sensible.
  const amountStep = currency.step ?? (currency.decimals === 0 ? 1000 : 1)

  const [description, setDescription] = React.useState('')
  const [amount, setAmount] = React.useState(0)
  const [paidBy, setPaidBy] = React.useState(members[0]?.id ?? '')
  const [checked, setChecked] = React.useState<Record<string, boolean>>({})
  const [mode, setMode] = React.useState<SplitMode>('equal')
  const [exact, setExact] = React.useState<Record<string, number>>({})
  const [shares, setShares] = React.useState<Record<string, number>>({})
  const [percents, setPercents] = React.useState<Record<string, number>>({})
  const [submitting, setSubmitting] = React.useState(false)

  // Reset to sensible defaults each time the dialog opens.
  React.useEffect(() => {
    if (!open) return
    setDescription('')
    setAmount(0)
    setPaidBy(members[0]?.id ?? '')
    setChecked(Object.fromEntries(members.map((m) => [m.id, true])))
    setMode('equal')
    setExact({})
    setShares(Object.fromEntries(members.map((m) => [m.id, 1])))
    setPercents({})
    setSubmitting(false)
  }, [open, members])

  const participants = members.filter((m) => checked[m.id]).map((m) => m.id)
  const total = toMinor(amount, currency)

  const config: SplitConfig = React.useMemo(() => {
    switch (mode) {
      case 'exact':
        return {
          mode,
          participants,
          amounts: Object.fromEntries(participants.map((id) => [id, toMinor(exact[id] ?? 0, currency)])),
        }
      case 'shares':
        return { mode, participants, shares: Object.fromEntries(participants.map((id) => [id, shares[id] ?? 0])) }
      case 'percent':
        return { mode, participants, percents: Object.fromEntries(participants.map((id) => [id, percents[id] ?? 0])) }
      default:
        return { mode: 'equal', participants }
    }
  }, [mode, participants, exact, shares, percents, currency])

  const error = total > 0 ? splitError(total, config) : 'Masukkan jumlah'
  const preview = error ? null : computeSplit(total, config)

  const splitEvenly = () => {
    const n = participants.length
    if (n === 0) return
    if (mode === 'percent') {
      const base = Math.floor((100 / n) * 100) / 100
      const next: Record<string, number> = {}
      participants.forEach((id, i) => {
        next[id] = i === 0 ? Math.round((100 - base * (n - 1)) * 100) / 100 : base
      })
      setPercents(next)
    } else if (mode === 'exact') {
      if (total <= 0) return
      // Use core's exact even split (minor units, no remainder), then show as major.
      const even = computeSplit(total, { mode: 'equal', participants })
      setExact(Object.fromEntries(participants.map((id) => [id, toMajor(even[id] ?? 0, currency)])))
    }
  }

  const submit = async () => {
    if (error || !paidBy) return
    setSubmitting(true)
    const expense = createExpense({ description, amount: total, paidBy, split: config })
    await mutateGroup(group.id, (g) => addExpense(g, expense))
    setSubmitting(false)
    onOpenChange(false)
  }

  const memberName = (id: string) => members.find((m) => m.id === id)?.name ?? '?'

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="lg" placement="top">
      <DialogHeader>
        <DialogTitle>Pengeluaran baru</DialogTitle>
      </DialogHeader>
      <DialogBody className="flex flex-col gap-4">
        <FormField label="Deskripsi">
          <Input
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mis. Makan malam"
            autoFocus
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label={`Jumlah (${currency.code})`}>
            <NumberInput
              value={amount}
              onChange={setAmount}
              min={0}
              precision={currency.decimals}
              step={amountStep}
            />
          </FormField>
          <FormField label="Dibayar oleh">
            <Select
              value={paidBy}
              onValueChange={(v) => setPaidBy(v ?? '')}
              options={members.map((m) => ({ value: m.id, label: m.name }))}
              placeholder="Pilih"
              className="w-full"
            />
          </FormField>
        </div>

        <FormField label="Pembagian">
          <SegmentedControl
            fullWidth
            options={MODE_OPTIONS}
            value={mode}
            onChange={(v) => setMode(v as SplitMode)}
          />
        </FormField>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <Text className="text-sm font-medium">Peserta</Text>
            {(mode === 'percent' || mode === 'exact') && (
              <Button size="xs" variant="ghost" color="neutral" onClick={splitEvenly}>
                Bagikan rata
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {members.map((m) => {
              const isIn = !!checked[m.id]
              return (
                <div key={m.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
                  <Checkbox
                    checked={isIn}
                    onCheckedChange={(c) => setChecked((prev) => ({ ...prev, [m.id]: c }))}
                    label={m.name}
                    className="min-w-24"
                  />
                  <div className="flex items-center gap-2">
                    {isIn && mode === 'exact' && (
                      <NumberInput
                        size="sm"
                        value={exact[m.id] ?? 0}
                        onChange={(v) => setExact((p) => ({ ...p, [m.id]: v }))}
                        min={0}
                        precision={currency.decimals}
                        step={amountStep}
                        className="w-40"
                      />
                    )}
                    {isIn && mode === 'shares' && (
                      <NumberInput
                        size="sm"
                        value={shares[m.id] ?? 0}
                        onChange={(v) => setShares((p) => ({ ...p, [m.id]: v }))}
                        min={0}
                        className="w-40"
                      />
                    )}
                    {isIn && mode === 'percent' && (
                      <NumberInput
                        size="sm"
                        value={percents[m.id] ?? 0}
                        onChange={(v) => setPercents((p) => ({ ...p, [m.id]: v }))}
                        min={0}
                        max={100}
                        slotProps={{ input: { style: { width: 72 } } }}
                      />
                    )}
                    {isIn && preview && (
                      <span className="w-24 text-right text-sm font-medium tabular-nums">
                        {formatMoney(preview[m.id] ?? 0, currency)}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {error && total > 0 && (
          <Text tone="danger" className="text-sm">
            {error}
          </Text>
        )}
      </DialogBody>
      <DialogFooter className="flex items-center justify-between">
        <Text tone="muted" className="text-sm">
          {preview ? `Dibayar ${memberName(paidBy)}` : ''}
        </Text>
        <div className="flex gap-2">
          <Button variant="ghost" color="neutral" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button color="primary" onClick={submit} loading={submitting} disabled={!!error || !paidBy}>
            Simpan
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  )
}

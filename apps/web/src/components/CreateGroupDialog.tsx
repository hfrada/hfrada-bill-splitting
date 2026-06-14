'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
  Select,
  Textarea,
} from '@bill/ui'
import { IDR, USD, type Currency } from '@bill/core'
import { useBillStore } from '@/data/store'

const CURRENCIES: Record<string, Currency> = { IDR, USD }

export function CreateGroupDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { createGroup } = useBillStore()
  const router = useRouter()
  const [name, setName] = React.useState('')
  const [currencyCode, setCurrencyCode] = React.useState('IDR')
  const [membersText, setMembersText] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  const reset = () => {
    setName('')
    setCurrencyCode('IDR')
    setMembersText('')
  }

  const submit = async () => {
    if (!name.trim()) return
    setSubmitting(true)
    const members = membersText
      .split('\n')
      .map((m) => m.trim())
      .filter(Boolean)
    const group = await createGroup({ name, currency: CURRENCIES[currencyCode] ?? IDR, members })
    setSubmitting(false)
    onOpenChange(false)
    reset()
    router.push(`/groups/${group.id}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="md">
      <DialogHeader>
        <DialogTitle>Grup baru</DialogTitle>
      </DialogHeader>
      <DialogBody className="flex flex-col gap-4">
        <FormField label="Nama grup" required>
          <Input
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mis. Liburan Bali"
            autoFocus
          />
        </FormField>

        <FormField label="Mata uang">
          <Select
            value={currencyCode}
            onValueChange={(v) => setCurrencyCode(v ?? 'IDR')}
            options={[
              { value: 'IDR', label: 'IDR — Rupiah' },
              { value: 'USD', label: 'USD — US Dollar' },
            ]}
          />
        </FormField>

        <FormField label="Anggota" helperText="Satu nama per baris (bisa ditambah nanti)">
          <Textarea
            fullWidth
            rows={4}
            value={membersText}
            onChange={(e) => setMembersText(e.target.value)}
            placeholder={'Andi\nBudi\nCitra'}
          />
        </FormField>
      </DialogBody>
      <DialogFooter>
        <Button variant="ghost" color="neutral" onClick={() => onOpenChange(false)}>
          Batal
        </Button>
        <Button color="primary" onClick={submit} loading={submitting} disabled={!name.trim()}>
          Buat grup
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

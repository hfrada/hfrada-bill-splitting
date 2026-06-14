'use client'

import * as React from 'react'
import { Button, Dialog, DialogBody, DialogFooter, DialogHeader, DialogTitle, FormField, Input } from '@bill/ui'
import { addMember, type Group } from '@bill/core'
import { useBillStore } from '@/data/store'

export function AddMemberDialog({
  group,
  open,
  onOpenChange,
}: {
  group: Group
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { mutateGroup } = useBillStore()
  const [name, setName] = React.useState('')

  const submit = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    await mutateGroup(group.id, (g) => addMember(g, trimmed))
    setName('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="sm">
      <DialogHeader>
        <DialogTitle>Tambah anggota</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <FormField label="Nama">
          <Input
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Nama anggota"
            autoFocus
          />
        </FormField>
      </DialogBody>
      <DialogFooter>
        <Button variant="ghost" color="neutral" onClick={() => onOpenChange(false)}>
          Batal
        </Button>
        <Button color="primary" onClick={submit} disabled={!name.trim()}>
          Tambah
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

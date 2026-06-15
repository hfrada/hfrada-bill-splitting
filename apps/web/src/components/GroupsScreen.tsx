'use client'

import { useBillStore } from '@/data/store'
import { avatarSolid, colorFor } from '@/lib/ui'
import { formatMoney, totalSpent, type Group } from '@bill/core'
import {
  AlertDialog,
  AvatarStack,
  Badge,
  Button,
  Card,
  Checkbox,
  cn,
  Heading,
  IconButton,
  Skeleton,
  Text,
} from '@bill/ui'
import { Plus, Receipt, Trash2, Users } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { CreateGroupDialog } from './CreateGroupDialog'
import { BottomBar } from './BottomBar'

export function GroupsScreen() {
  const { ready, groups, deleteGroup } = useBillStore()
  const [createOpen, setCreateOpen] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  const allChecked = groups.length > 0 && selected.size === groups.length
  const someChecked = selected.size > 0 && !allChecked

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(groups.map((g) => g.id)))

  const deleteSelected = async () => {
    for (const id of selected) await deleteGroup(id)
    setSelected(new Set())
  }

  return (
    <div>
      <div className="mb-6">
        <Heading level={6} variant="display" balance>
          Grup kamu
        </Heading>
        <Text size="sm" tone="muted" className="block">
          Kelola patungan dan lihat siapa berutang ke siapa.
        </Text>
      </div>

      {!ready ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : groups.length === 0 ? (
        <Card variant="soft" className="flex flex-col items-center gap-4 px-6 py-14 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-500/10 text-primary-600">
            <Users size={26} />
          </span>
          <div>
            <Heading level={6}>Belum ada grup</Heading>
            <Text size="sm" tone="muted" className="block max-w-xs">
              Buat grup pertama untuk mulai mencatat pengeluaran bersama teman.
            </Text>
          </div>
          <Button color="primary" startIcon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
            Buat grup pertama
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((g) => (
            <GroupRow key={g.id} group={g} checked={selected.has(g.id)} onToggle={() => toggle(g.id)} />
          ))}
        </div>
      )}

      <CreateGroupDialog open={createOpen} onOpenChange={setCreateOpen} />

      <AlertDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        tone="danger"
        title={`Hapus ${selected.size} grup?`}
        description="Grup terpilih beserta seluruh pengeluaran & pelunasannya akan dihapus permanen."
        confirmLabel="Hapus"
        cancelLabel="Batal"
        autoLoading
        onConfirm={deleteSelected}
      />

      <BottomBar>
        <div className="flex w-full items-center justify-between gap-3">
          <Checkbox
            variant="square"
            radius="sm"
            checked={allChecked}
            indeterminate={someChecked}
            disabled={groups.length === 0}
            onCheckedChange={toggleAll}
            className="ml-3"
            label={selected.size > 0 ? `${selected.size} dipilih` : 'Pilih semua'}
            slotProps={{
              control: {
                className: cn(
                  'mt-0.5 inline-flex h-[1.15rem] w-[1.15rem] shrink-0 items-center justify-center rounded-xs border transition-colors',
                  // unchecked: subtle grey from theme tokens (adapts to light/dark)
                  'border-border bg-slate-500/10 text-transparent',
                  // checked: primary fill
                  'peer-checked:border-primary-600 peer-checked:bg-primary-600 peer-checked:text-white',
                  'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg',
                ),
              },
            }}
          />
          <div className="flex items-center gap-2">
            <IconButton
              color="primary"
              size="lg"
              radius="full"
              aria-label="Buat grup baru"
              icon={<Plus size={22} />}
              onClick={() => setCreateOpen(true)}
            />
            <IconButton
              color="danger"
              variant="soft"
              size="lg"
              radius="full"
              aria-label="Hapus grup terpilih"
              icon={<Trash2 size={20} />}
              disabled={selected.size === 0}
              onClick={() => setConfirmOpen(true)}
            />
          </div>
        </div>
      </BottomBar>
    </div>
  )
}

function GroupRow({
  group,
  checked,
  onToggle,
}: {
  group: Group
  checked: boolean
  onToggle: () => void
}) {
  return (
    <Card variant="outline" hoverable className={cn('relative', checked && 'ring-2 ring-primary-500')}>
      <Checkbox
        variant="square"
        checked={checked}
        onCheckedChange={onToggle}
        aria-label={`Pilih ${group.name}`}
        className="absolute left-3 top-1/2 z-10 -translate-y-1/2"
        slotProps={{
          control: {
            className: cn(
              'mt-0.5 inline-flex h-[1.15rem] w-[1.15rem] shrink-0 items-center justify-center rounded-xs border transition-colors',
              // unchecked: subtle grey from theme tokens (adapts to light/dark)
              'border-border bg-slate-500/10 text-transparent',
              // checked: primary fill
              'peer-checked:border-primary-600 peer-checked:bg-primary-600 peer-checked:text-white',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg',
            ),
          },
        }}
      />

      <Link href={`/groups/${group.id}`} className="flex flex-row items-center gap-3 p-3 pl-11">
        <div className="flex-1 space-y-2.5">
          <div className="min-w-0 flex-1 flex gap-3 items-center">
            <span className="grid size-12 place-items-center rounded-full bg-primary-50 text-primary shadow-sm">
              <Users size={24} strokeWidth={2.4} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="truncate text-base font-semibold">{group.name}</span>
                <Badge variant="soft" color="neutral" size="xs">
                  {group.currency.code}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-fg-muted sm:gap-2">
                <span className="inline-flex items-center gap-1">
                  <Users size={14} className="sm:hidden" />
                  {group.members.length}
                  <span className="hidden sm:inline">anggota</span>
                </span>
                <span className="text-fg-subtle">·</span>
                <span className="inline-flex items-center gap-1">
                  <Receipt size={14} className="sm:hidden" />
                  {group.expenses.length}
                  <span className="hidden sm:inline">pengeluaran</span>
                </span>
              </div>
            </div>
          </div>
          {group.members.length > 0 ? (
            <AvatarStack
              size="sm"
              max={4}
              items={group.members.map((m) => {
                const c = colorFor(m.id)
                return { name: m.name, color: c, slotProps: { fallback: { className: avatarSolid(c) } } }
              })}
              slotProps={{ avatar: { className: 'ring-surface' } }}
            />
          ) : (
            <span className="grid h-9 w-9 place-items-center rounded-full bg-neutral-500/10 text-fg-muted">
              <Users size={16} />
            </span>
          )}
        </div>

        <div className="text-right">
          <Text tone="subtle" className="block text-xs">
            Total
          </Text>
          <span className="font-semibold tabular-nums">{formatMoney(totalSpent(group), group.currency)}</span>
        </div>
      </Link>
    </Card>
  )
}

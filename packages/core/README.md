# @bill/core

Logika domain murni untuk aplikasi patungan: tipe, perhitungan pembagian, saldo,
penyederhanaan utang, dan abstraksi penyimpanan. **Tanpa dependensi UI**, mudah
diuji (lihat `src/*.test.ts`).

> **Uang selalu dalam satuan minor (integer)** — mis. sen untuk USD, dan rupiah
> utuh untuk IDR (`decimals: 0`). Ini menghindari bug pembulatan float.

## Konsep

| Tipe         | Keterangan                                                        |
| ------------ | ---------------------------------------------------------------- |
| `Group`      | Akar agregat: anggota, pengeluaran, pelunasan, mata uang.        |
| `Member`     | `{ id, name }`                                                   |
| `Expense`    | Pengeluaran + `shares` (porsi tiap anggota, hasil snapshot).     |
| `Settlement` | Pembayaran antar-anggota (`from → to`).                          |
| `SplitMode`  | `'equal' \| 'exact' \| 'shares' \| 'percent'`                    |

## API utama

### Pembagian — `split.ts`

```ts
import { computeSplit, splitError } from '@bill/core'

// Validasi dulu (mengembalikan pesan error ramah atau null)
const err = splitError(total, config)

// Hasil: porsi (minor units) per anggota, dijamin SAMA dengan total
const shares = computeSplit(300_00, {
  mode: 'shares',
  participants: ['a', 'b'],
  shares: { a: 2, b: 1 }, // → { a: 200_00, b: 100_00 }
})
```

Mode: `equal` (rata), `exact` (jumlah pasti per orang, harus = total),
`shares` (bobot), `percent` (persen, total 100). Sisa pembulatan dibagikan dengan
metode *largest-remainder* agar selalu pas.

### Saldo — `balances.ts`

```ts
import { groupBalances, totalSpent } from '@bill/core'

const balances = groupBalances(group) // Record<memberId, number>
// > 0 → akan menerima, < 0 → harus membayar; total selalu nol
```

### Penyederhanaan utang — `settle.ts`

```ts
import { simplifyDebts } from '@bill/core'

const transfers = simplifyDebts(balances) // Transfer[] paling sedikit
// [{ from, to, amount }, ...]
```

### Operasi & factory — `operations.ts`

```ts
import { createGroup, createExpense, addExpense, addSettlement } from '@bill/core'

const group = createGroup({ name: 'Liburan', currency: IDR, members: ['Andi', 'Budi'] })
const exp = createExpense({ description: 'Makan', amount: 300_000, paidBy, split })
const next = addExpense(group, exp) // immutable, kembalikan Group baru
```

### Uang — `money.ts`

`toMinor(major, currency)`, `toMajor(minor, currency)`, `formatMoney(minor, currency)`.

## Penyimpanan — `storage/`

Semua adapter meng-implement interface async `BillRepository`
(`listGroups`, `getGroup`, `saveGroup`, `deleteGroup`):

```ts
import { LocalStorageRepository, InMemoryRepository } from '@bill/core'

const repo = new LocalStorageRepository()  // browser
const test = new InMemoryRepository()      // test / SSR
```

Mau backend SQL? Cukup buat kelas baru yang meng-implement `BillRepository` —
sisa aplikasi tidak berubah.

## Skrip

```bash
pnpm --filter @bill/core test       # jalankan unit test (Vitest)
pnpm --filter @bill/core typecheck
```

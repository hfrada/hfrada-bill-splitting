# Catatan Teknis (Developer)

Detail arsitektur monorepo dan keputusan integrasi. Untuk panduan umum lihat
[README.md](README.md).

## Konsumsi `purbio-react-ui`

`purbio-react-ui` dipakai sebagai **git submodule** di `packages/purbio-react-ui`
dan dikonsumsi sebagai **source TS/TSX** (tanpa build terpisah) — Next.js yang
meng-compile lewat `transpilePackages`. Beberapa penyesuaian diperlukan karena
library ini awalnya untuk SPA (Vite):

1. **`exports` + `peerDependencies`** ditambahkan ke `package.json` submodule agar
   bisa di-import sebagai paket workspace (`.` → `./src/lib/index.ts`).
2. **Alias `@lib/*`** — source purbio memakai alias internal ini. Dipetakan di
   `tsconfig` konsumen dan di `webpack.resolve.alias` ([apps/web/next.config.mjs](apps/web/next.config.mjs)).
3. **Batas `'use client'`** — purbio tidak punya direktif `'use client'`, jadi
   barrel `@bill/ui` ([packages/ui/src/index.ts](packages/ui/src/index.ts)) diberi
   `'use client'` sebagai satu batas client tunggal.
4. **`postcss-import`** — agar token CSS purbio ter-inline sebelum Tailwind jalan
   ([apps/web/postcss.config.js](apps/web/postcss.config.js)).

> ⚠️ Submodule punya **commit lokal** (`exports` + peerDeps) yang **belum di-push**.
> Saat fresh clone, submodule bisa berada di commit upstream lama sehingga build gagal.
> Solusi: push commit tsb ke repo purbio, atau terapkan ulang edit `exports`/peerDeps.

## Layer & paket

| Paket               | Isi                                                                 |
| ------------------- | ------------------------------------------------------------------- |
| `@bill/core`        | Logika domain murni (split, saldo, simplify) + `BillRepository`.    |
| `@bill/ui`          | Re-export purbio + `AppThemeProvider` (brand) + preset Tailwind.    |
| `@bill/web`         | Aplikasi Next.js. Data layer di [src/data/store.tsx](apps/web/src/data/store.tsx). |
| `purbio-react-ui`   | Submodule library komponen.                                         |

## Tailwind

App memakai preset bersama dari `@bill/ui/tailwind-preset` (mirror token purbio:
warna sebagai CSS variable triplet RGB sehingga theming runtime + modifier alpha
tetap jalan). `content` di [apps/web/tailwind.config.ts](apps/web/tailwind.config.ts)
men-scan source app + kedua paket UI agar utility class ter-generate.

Class warna dinamis **tidak boleh** dirakit lewat string (`bg-${c}-500`) karena
akan ke-purge — gunakan map literal (lihat [apps/web/src/lib/ui.ts](apps/web/src/lib/ui.ts)).

## Versi

React **18** dikunci di seluruh workspace agar cocok dengan peer-dep purbio
(Next.js 14, bukan 15/React 19).

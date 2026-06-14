# Patungan — Aplikasi Bagi Tagihan

Aplikasi split-bill skala menengah: kelola grup, catat pengeluaran, dan lihat
otomatis **siapa berutang ke siapa**. Dibangun sebagai **monorepo** dengan
**Next.js + Turborepo + TypeScript + Tailwind**, memakai komponen dari
[`purbio-react-ui`](https://github.com/hfrada/purbio-react-ui).

## Fitur

- **Multi-grup** — tiap grup punya anggota, mata uang, pengeluaran, dan pelunasan sendiri.
- **4 mode pembagian** per pengeluaran: **Rata**, **Fix**, **Share (bobot)**, **Persen**.
- **Saldo otomatis** — tahu siapa kelebihan/kekurangan bayar, dengan visualisasi bar.
- **Penyederhanaan utang** — saran transfer paling sedikit ("siapa bayar siapa").
- **Pelunasan** — catat pembayaran antar-anggota; saldo ikut menyesuaikan.

## Struktur

```
.
├── apps/
│   └── web/                  # Aplikasi Next.js 14 (App Router, Tailwind v3)
├── packages/
│   ├── core/                 # @bill/core — logika domain murni + storage (teruji)
│   ├── ui/                   # @bill/ui — re-export purbio + tema + preset Tailwind
│   └── purbio-react-ui/      # submodule git (library komponen React 18)
├── turbo.json · pnpm-workspace.yaml · tsconfig.base.json
```

Detail arsitektur teknis (cara konsumsi submodule, alias `@lib`, batas `'use client'`)
ada di [README.dev.md](README.dev.md). Dokumentasi API domain: [packages/core/README.md](packages/core/README.md).

## Memulai

```bash
# 1. Clone BESERTA submodule
git clone --recurse-submodules <repo-url>
# (sudah terlanjur clone? jalankan: git submodule update --init --recursive)

# 2. Pasang dependensi
pnpm install

# 3. Jalankan
pnpm dev            # → http://localhost:3000
```

> Butuh **Node ≥ 20** dan **pnpm 11**.

## Perintah (dari root)

| Perintah         | Fungsi                                  |
| ---------------- | --------------------------------------- |
| `pnpm dev`       | Jalankan aplikasi web (mode dev)        |
| `pnpm build`     | Build produksi aplikasi web             |
| `pnpm test`      | Jalankan unit test (`@bill/core`)       |
| `pnpm typecheck` | Cek tipe seluruh paket                  |
| `pnpm lint`      | Lint seluruh paket                      |

## Cara pakai aplikasi

1. **Buat grup** → isi nama, mata uang, dan daftar anggota (satu nama per baris).
2. Buka grup → tab **Pengeluaran** → **+ Pengeluaran**: isi jumlah, pembayar,
   peserta, dan pilih mode pembagian. Hasil pembagian tampil langsung sebagai preview.
3. Tab **Saldo & Pelunasan** → lihat saldo tiap anggota dan **saran pelunasan**.
   Klik **Lunasi** untuk mencatat pembayaran.

## Catatan

- Data disimpan di **localStorage** (per-browser). Untuk backend, cukup buat adapter
  baru yang meng-implement `BillRepository` — UI & logika domain tidak perlu diubah.
- Belum termasuk: multi-pembayar, mata uang per-pengeluaran, kategori, foto struk,
  recurring, dan sinkronisasi cloud.

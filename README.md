# 🏭 Hybrid Warehouse Fulfillment Dashboard

> Prototype sistem manajemen operasional gudang hybrid untuk PT Wikrama Dharma Tunggadewa, Jombang, Jawa Timur — dikembangkan sebagai showcase portofolio.

**Live Demo:** [warehouse-fulfillment-dashboard.vercel.app](https://warehouse-fulfillment-dashboard.vercel.app/dashboard)

---

## Latar Belakang Bisnis

Gudang ini menjalankan dua model bisnis secara bersamaan (**Hybrid Warehouse**):

### 1. Sewa Space (Passive Income — 50%)
Klien menyewa area gudang per m² per bulan dan mengelola operasional sendiri. Pendapatan stabil namun margin tipis — berfungsi sebagai pelapis keamanan finansial di periode sepi.

| Tipe Kontrak | Tarif |
|---|---|
| Reguler | Rp 38.000/m²/bulan |
| Group (min. 12 bulan) | Rp 36.000/m²/bulan |

### 2. Jasa Fulfillment (Active Income — 50%)
Gudang mengerjakan seluruh operasional untuk klien dan menagih **per aktivitas**. Margin lebih tinggi dan scalable — ini engine profit utama.

| Aktivitas | Tarif |
|---|---|
| Inbound (penerimaan barang) | Rp 100.000/batch |
| Storage (penyimpanan) | Rp 38.000/m²/bulan |
| Outbound (pengiriman order) | Rp 2.500/order |
| Picking & Packing | Rp 2.000/item |
| Return (retur barang) | Rp 2.000/item |
| Expired (pemusnahan/pengembalian) | Rp 2.000/item |
| Withdrawal (penarikan stok klien) | Rp 500/palet |

### Mengapa Hybrid?

Simulasi menunjukkan dengan luas area yang sama (720 m² efektif):

| Model | Est. Revenue/Bulan |
|---|---|
| Sewa Space 100% | Rp 27.360.000 |
| Fulfillment 100% | Rp 313.800.000 |
| **Hybrid 50:50** | **Rp 169.780.000** |

Hybrid dipilih karena Sewa Space menjamin cash flow minimum, sementara Fulfillment menjadi mesin profit yang terus berkembang seiring bertambahnya klien.

---

## Business Rules yang Diimplementasi

### Dead Stock Fee
Barang yang tidak bergerak lebih dari **90 hari** dikenakan biaya 2× tarif normal sebagai penalti. Warning dikirim pada hari ke-60. Ini melindungi kapasitas gudang dari penumpukan barang tidak aktif.

### Tiering Fee Picking & Packing
Tarif picking & packing disesuaikan berdasarkan ukuran SKU:

| Ukuran | Multiplier |
|---|---|
| Small (<5kg, <5.000 cm³) | 1× (Rp 2.000/item) |
| Medium (5–20kg, 5.000–50.000 cm³) | 1.5× (Rp 3.000/item) |
| Large (>20kg, >50.000 cm³) | 2× (Rp 4.000/item) |

### Minimum Billing
Setiap klien memiliki threshold minimum tagihan bulanan. Jika total fee aktivitas di bawah threshold, tagihan otomatis di-floor ke nilai minimum.

### Auto-Kalkulasi Billing
Tagihan bulanan dihitung otomatis dari seluruh transaksi yang tercatat — bukan input manual. Setiap aktivitas fulfillment langsung berkontribusi ke billing bulan berjalan.

---

## Alur Operasional

```
INBOUND          STORAGE          OUTBOUND
Barang datang → Simpan di rak → Order masuk
    ↓                               ↓
  QC & Label              Picking dari rak
    ↓                               ↓
Catat batch                    Packing
    ↓                               ↓
Tagih Rp 100k/batch         Serah ke kurir
                                    ↓
                           Tagih Rp 2.500 + Rp 2.000/item
```

Status tracking outbound: `pending → picking → packing → siap_kirim → terkirim`

---

## Fitur Sistem

### Dashboard
- Statistik harian: total klien aktif, SKU kritis, transaksi bulan ini, total revenue
- Alur operasional real-time (terhubung ke data fulfillment harian)
- Perbandingan revenue: Sewa Space vs Jasa Fulfillment
- Peringatan stok menipis/kritis
- Transaksi terbaru (live dari aktivitas fulfillment)

### KPI Panel
6 KPI utama yang dimonitor:
- Profit per m² efektif
- Tingkat utilisasi gudang (target >85%)
- Turnover rate per SKU
- Rasio dead stock (target <10%)
- Retensi klien (target >80%)
- Revenue mix: Space vs Fulfillment

### Manajemen Klien
- Daftar klien dengan filter tipe (space/fulfillment/hybrid), kontrak, dan status
- Detail per klien: profil, SKU list, riwayat transaksi, billing bulan ini
- Summary: total area tersewa, estimasi revenue bulanan, rata-rata rate

### Inventori SKU
- Monitoring stok seluruh klien dengan status aman/menipis/kritis
- Multi-filter: kategori, status, klien
- Progress bar stok per SKU
- Restock alert panel untuk SKU kritis

### Fulfillment Operations
Form operasional harian dengan 5 modul:
- **Inbound** — penerimaan barang, catat batch, qty palet & unit
- **Outbound** — buat order, tracking status picking → packing → terkirim
- **Return** — catat retur dengan alasan dan status penanganan
- **Withdrawal** — form penarikan stok oleh klien
- **Expired** — penanganan barang kedaluwarsa (pemusnahan/pengembalian)

### Peta Gudang
- Visualisasi grid palet 2 zona (Area Sewa Space + Area Fulfillment)
- Color-coded: kosong (abu) / terisi (hijau) / penuh (merah) / dead stock (oranye)
- Hover tooltip: detail palet, klien, SKU, qty
- Tingkat okupansi gudang secara keseluruhan

### Billing
- Rekap tagihan bulanan per klien dengan breakdown 8 komponen fee
- Toggle: kalkulasi otomatis dari data transaksi vs data statis
- Pie chart komposisi revenue: Storage vs Fulfillment
- Status tagihan: draft / terkirim / lunas

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui v4 (Nova preset) |
| Charts | Recharts 3.x |
| Icons | Lucide React |
| Data | Mock JSON + localStorage |
| Deploy | Vercel |

---

## Struktur Proyek

```
src/
├── app/
│   ├── dashboard/        → Overview & KPI
│   ├── clients/          → Manajemen klien + detail
│   ├── inventory/        → Monitoring stok SKU
│   ├── fulfillment/      → Form operasional harian
│   ├── warehouse/        → Peta gudang visual
│   └── billing/          → Tagihan bulanan
├── components/
│   ├── layout/           → Sidebar + Header
│   └── ui/               → shadcn components
├── data/mock/
│   ├── clients.json      → 6 klien
│   ├── skus.json         → 12 SKU
│   ├── transactions.json → 18 transaksi
│   ├── billing.json      → 8 billing records
│   ├── pallets.json      → Data palet per zona
│   └── warehouse.json    → Konfigurasi gudang
├── lib/
│   ├── utils.ts          → formatRupiah, formatNumber
│   └── billing-engine.ts → Dead stock, tiering, min billing
└── types/
    └── index.ts          → TypeScript interfaces
```

---

## Cakupan Implementasi

Berdasarkan dokumen strategi bisnis PT Wikrama Dharma Tunggadewa:

| Kategori | Implemented | Partial | Missing |
|---|---|---|---|
| Business Rules (29) | 9 (31%) | 5 (17%) | 15 (52%) |
| Data Entities | 4 | 2 | 0 |
| Business Logic | 3 | 0 | 0 |
| KPI Monitoring | 6 | 0 | 0 |

### Yang sudah diimplementasi penuh:
- ✅ Semua 7 komponen fee fulfillment
- ✅ Dead stock fee calculation (2× >90 hari)
- ✅ Tiering fee per ukuran SKU (1×/1.5×/2×)
- ✅ Minimum billing floor per klien
- ✅ Auto-kalkulasi billing dari data transaksi
- ✅ 6 KPI dari grounding document

### Roadmap (di luar scope prototype):
- Client portal (akses terbatas per klien)
- Workflow inbound/outbound dengan barcode scan
- Integrasi marketplace (Tokopedia, Shopee, E-Katalog)
- Auto-billing via Xendit (Virtual Account)
- Real-time updates via Supabase

---

## Menjalankan Lokal

```bash
git clone https://github.com/ardhian159-bit/warehouse-fulfillment-dashboard
cd warehouse-fulfillment-dashboard
npm install
npm run dev
```

Buka [localhost:3000](http://localhost:3000)

---

## Catatan

Ini adalah **prototype frontend** untuk keperluan portofolio dan demonstrasi konsep bisnis. Data menggunakan mock JSON dan localStorage — tidak terhubung ke database atau backend. Seluruh business logic (dead stock, tiering, billing) berjalan di sisi klien menggunakan data simulasi.

Untuk versi production, sistem ini dirancang untuk diintegrasikan dengan Supabase (PostgreSQL + RLS) sebagai backend, dengan schema yang sudah disiapkan di dokumentasi terpisah.

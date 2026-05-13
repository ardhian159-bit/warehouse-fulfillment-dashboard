# Hybrid Warehouse & Fulfillment — Business Grounding Document

> **Purpose:** Dokumen ini adalah sumber kebenaran tunggal (*single source of truth*) untuk proyek Hybrid Warehouse & Fulfillment. Digunakan sebagai konteks dasar bagi AI agent, developer, dan stakeholder dalam membangun sistem, membuat keputusan bisnis, atau menghasilkan analisis.

---

## 1. Business Concept Overview

### 1.1 Definisi Model Bisnis

Model **Hybrid Warehouse** adalah strategi pengelolaan gudang yang membagi kapasitas lahan menjadi dua aliran pendapatan secara bersamaan:

| Stream | Proporsi Lahan | Tipe Pendapatan | Analogi |
|---|---|---|---|
| Sewa Space | 50% | Fixed / Stabil | "Steak" — dasar bisnis |
| Jasa Fulfillment | 50% | Variable / Tinggi | "Sauce" — keuntungan utama |

### 1.2 Filosofi Inti

- **Sewa Space** berfungsi sebagai *financial floor* — menjamin biaya operasional dasar terbayar meskipun volume fulfillment sedang rendah (low season).
- **Fulfillment** berfungsi sebagai *profit engine* — monetisasi tenaga kerja, sistem WMS, dan aktivitas barang, bukan sekadar lantai.
- **Cross-subsidize strategy:** Margin dari fulfillment digunakan untuk menawarkan harga sewa space yang kompetitif demi menarik klien besar.

---

## 2. Business Rules

### 2.1 Aturan Umum Penggunaan Lahan

```
RULE-LAHAN-01: Total luas gudang dibagi tepat 50:50 antara area Sewa Space dan area Fulfillment.
RULE-LAHAN-02: Rasio efisiensi luas lantai untuk penyimpanan adalah 60%-70% dari total luas bruto.
RULE-LAHAN-03: Jalur forklift standar minimal 3–3.5 meter. Jika menggunakan Reach Truck, minimal 2.7 meter.
RULE-LAHAN-04: Jarak bebas atap/lampu (fire clearance) minimal 0.5–1 meter dari batas atas tumpukan.
RULE-LAHAN-05: Tinggi tumpukan barang maksimal 4 meter (pada gudang tinggi 5 meter).
```

### 2.2 Aturan Kapasitas Palet

```
RULE-PALET-01: Ukuran standar palet ISO = 120 cm x 100 cm = ±1.2 m² per posisi palet.
RULE-PALET-02: Floor Stacking: maksimal 3 tumpuk vertikal per posisi palet (aman/standar).
RULE-PALET-03: Racking System: 2–3 level per posisi; efisiensi lantai lebih rendah (~600 m² efektif dari 720 m²).
RULE-PALET-04: Estimasi kapasitas Floor Stacking pada 720 m² = ±1.800 palet.
RULE-PALET-05: Estimasi kapasitas Racking System pada 720 m² = ±1.200–1.500 palet.
```

### 2.3 Aturan Tarif Sewa Space

```
RULE-SEWA-01: Tarif Reguler = Rp 38.000 / m² / bulan.
RULE-SEWA-02: Tarif Group (kontrak minimal 1 tahun) = Rp 36.000 / m² / bulan.
RULE-SEWA-03: Diskon Group hanya berlaku untuk kontrak minimal 12 bulan (binding).
RULE-SEWA-04: Biaya asuransi barang Reguler = 0.3% dari nilai barang per item.
RULE-SEWA-05: Biaya asuransi barang Group = 0.2% dari nilai barang per item.
RULE-SEWA-06: Dead Stock Fee — barang tidak bergerak >90 hari dikenakan tarif penyimpanan 2x lipat tarif normal.
```

### 2.4 Aturan Tarif Fulfillment

```
RULE-FF-01: Inbound Fee = Rp 100.000 / batch.
RULE-FF-02: Outbound Fee = Rp 2.500 / order.
RULE-FF-03: Storage Fee (dalam paket fulfillment) mengikuti tarif Sewa Space berlaku.
RULE-FF-04: Picking & Packing Fee = Rp 2.000 / aktivitas.
RULE-FF-05: Return Fee = Rp 2.000 / item return (barang rusak / gagal kirim).
RULE-FF-06: Expired Fee (pemusnahan/pengembalian) = Rp 2.000 / item.
RULE-FF-07: Withdrawal Fee = Rp 500 / aktivitas penarikan barang khusus.
RULE-FF-08: Tiering wajib diterapkan — harga berbeda untuk barang kecil, sedang, dan besar.
RULE-FF-09: Minimum billing berlaku pada area fulfillment untuk mencegah kerugian saat volume klien sedang sepi.
```

### 2.5 Aturan Upselling & Add-on

```
RULE-UP-01: Layanan tambahan yang dapat ditawarkan: bubble wrap, kardus custom, sisipan brosur, manajemen retur.
RULE-UP-02: Keuntungan tambahan dapat diperoleh dari selisih harga material (beli grosir, jual eceran ke klien).
RULE-UP-03: Biaya laporan stok khusus (custom stock report) dapat ditagihkan sebagai biaya admin tambahan.
RULE-UP-04: Strategi konversi: Klien Sewa Space diberi penawaran "Trial Fulfillment" untuk 5 SKU terlaris mereka.
```

---

## 3. Business Concepts & Definitions

### 3.1 Glosarium Istilah Kunci

| Istilah | Definisi |
|---|---|
| **SKU** (Stock Keeping Unit) | Kode unik untuk setiap varian produk yang disimpan di gudang |
| **WMS** (Warehouse Management System) | Sistem informasi untuk mengelola pergerakan dan penyimpanan barang |
| **Inbound** | Proses penerimaan barang masuk ke gudang (bongkar, QC, labeling, input sistem) |
| **Outbound** | Proses pengiriman barang keluar dari gudang berdasarkan order |
| **Picking** | Proses pengambilan barang dari rak sesuai pesanan |
| **Packing** | Proses pengemasan barang sebelum dikirim |
| **Dead Stock** | Barang yang tidak bergerak (tidak keluar/masuk) selama ≥ 90 hari |
| **Racking System** | Sistem rak besi bertingkat untuk memaksimalkan kapasitas vertikal |
| **Floor Stacking** | Metode menumpuk palet langsung di lantai tanpa rak |
| **Reach Truck** | Jenis forklift dengan jalur aisle lebih sempit untuk efisiensi lahan |
| **D2C** (Direct to Consumer) | Brand yang menjual langsung ke konsumen akhir, tanpa perantara distributor |
| **Stickiness** | Tingkat ketergantungan klien terhadap layanan (sulit pindah karena integrasi sistem) |
| **Tiering** | Struktur harga berjenjang berdasarkan volume, ukuran, atau kategori layanan |
| **Minimum Billing** | Nilai tagihan minimum yang harus dibayar klien terlepas dari volume aktual |
| **Return** | Barang yang dikembalikan oleh konsumen akhir ke gudang karena rusak / salah kirim |
| **Cross-subsidize** | Menggunakan profit dari satu lini bisnis untuk mendukung daya saing lini lain |

### 3.2 Segmentasi Klien Target

| Segmen | Model Layanan | Karakteristik |
|---|---|---|
| Distributor besar | Sewa Space | Volume stok besar, turnover lambat, butuh lahan luas |
| Pabrik / Manufaktur | Sewa Space | Stok raw material atau finished goods, kontrak jangka panjang |
| Online Shop / e-Commerce | Fulfillment | Volume order harian tinggi, butuh kecepatan picking & packing |
| Brand D2C | Fulfillment | Kontrol penuh atas packaging, butuh layanan value-added |
| UMKM | Fulfillment (entry level) | Volume kecil, tidak punya gudang sendiri, harga sensitif |

---

## 4. Financial Model & Simulation

### 4.1 Asumsi Dasar Simulasi

- **Luas Gudang Total:** 1.200 m²
- **Rasio Efisiensi:** 60% → Luas Efektif Penyimpanan: **720 m²**
- **Multiplier Volume (Rak/Tumpuk):** 3 level/tumpuk
- **Metode Referensi:** Racking System dengan kapasitas ±1.500 palet

### 4.2 Simulasi Sewa Space — Tarif Reguler

| Komponen | Kalkulasi | Nilai |
|---|---|---|
| **Pendapatan Kotor** | 720 m² × Rp 38.000 × 3 level | **Rp 82.080.000 / bulan** |
| Listrik & Maintenance | 720 × Rp 4.000 × 3 | Rp 8.640.000 |
| Gaji Security (2 orang) | 720 × Rp 2.500 × 3 | Rp 5.400.000 |
| WMS & Server | 720 × Rp 2.000 × 3 | Rp 4.320.000 |
| Penyusutan Rak | 720 × Rp 3.000 × 3 | Rp 6.480.000 |
| Gaji Karyawan (6 orang) | 720 × Rp 8.000 × 3 | Rp 17.280.000 |
| **Total Beban** | | **Rp 42.120.000 / bulan** |
| **Profit Bersih** | | **Rp 39.960.000 / bulan** |

### 4.3 Simulasi Sewa Space — Tarif Group

| Komponen | Kalkulasi | Nilai |
|---|---|---|
| **Pendapatan Kotor** | 720 × Rp 36.000 × 3 | **Rp 77.760.000 / bulan** |
| Listrik & Maintenance | 720 × Rp 4.000 × 3 | Rp 8.640.000 |
| Gaji Security (2 orang) | 720 × Rp 2.500 × 3 | Rp 5.400.000 |
| WMS & Server | 720 × Rp 1.500 × 3 | Rp 3.240.000 |
| Penyusutan Rak | 720 × Rp 3.000 × 3 | Rp 6.480.000 |
| Gaji Karyawan (6 orang) | 720 × Rp 8.000 × 3 | Rp 17.280.000 |
| **Total Beban** | | **Rp 41.040.000 / bulan** |
| **Profit Bersih** | | **Rp 36.720.000 / bulan** |

### 4.4 Simulasi Fulfillment — Breakdown Per Fee (Reguler)

| Fee Type | Pendapatan Kotor | Beban Operasional | Profit Bersih |
|---|---|---|---|
| Inbound Fee | Rp 216.000.000 | Rp 108.000.000 | **Rp 108.000.000** |
| Outbound Fee | Rp 5.400.000 | Rp 2.808.000 | **Rp 2.592.000** |
| Storage Fee | Rp 82.080.000 | Rp 42.120.000 | **Rp 39.960.000** |
| Picking & Packing | Rp 4.320.000 | Rp 2.808.000 | **Rp 1.512.000** |
| Return Fee | Rp 4.320.000 | Rp 3.024.000 | **Rp 1.296.000** |
| Expired Fee | Rp 4.320.000 | Rp 1.620.000 | **Rp 2.700.000** |
| Withdrawal Fee | Rp 1.080.000 | Rp 432.000 | **Rp 648.000** |
| **TOTAL** | | | **Rp 156.492.000 / bulan** |

### 4.5 Simulasi Fulfillment — Breakdown Per Fee (Group)

| Fee Type | Pendapatan Kotor | Beban Operasional | Profit Bersih |
|---|---|---|---|
| Inbound Fee | Rp 216.000.000 | Rp 108.000.000 | **Rp 108.000.000** |
| Outbound Fee | Rp 5.400.000 | Rp 2.808.000 | **Rp 2.592.000** |
| Storage Fee | Rp 77.760.000 | Rp 41.040.000 | **Rp 36.720.000** |
| Picking & Packing | Rp 4.320.000 | Rp 2.808.000 | **Rp 1.512.000** |
| Return Fee | Rp 4.320.000 | Rp 3.024.000 | **Rp 1.296.000** |
| Expired Fee | Rp 4.320.000 | Rp 1.620.000 | **Rp 2.700.000** |
| Withdrawal Fee | Rp 1.080.000 | Rp 648.000 | **Rp 432.000** |
| **TOTAL** | | | **Rp 153.252.000 / bulan** |

### 4.6 Komparasi Final: Sewa Space vs Fulfillment

| Indikator | Sewa Space (Reguler) | Fulfillment (Reguler) |
|---|---|---|
| Profit Bersih / Bulan | Rp 39.960.000 | Rp 156.492.000 |
| Margin vs Gross Revenue | ~48.7% | ~50%+ (varies by stream) |
| Stabilitas Arus Kas | Sangat Stabil | Fluktuatif (musiman) |
| Intensitas Kerja | Rendah | Sangat Tinggi |
| Kecepatan Balik Modal | Lambat | Cepat (jika volume tinggi) |
| Kebutuhan SDM | 2 orang (Security/Admin) | 3–5 orang (Picker, Packer, Admin) |
| Risiko Utama | Kerusakan bangunan | Barang hilang, salah kirim, komplain |
| Target Klien | Distributor, Pabrik | Online Shop, D2C, UMKM |

> **Kesimpulan:** Dengan luas lahan yang sama, Fulfillment menghasilkan profit ±**4× lebih besar** dari Sewa Space. Namun model Hybrid adalah struktur paling aman secara finansial.

---

## 5. Profitability Indicators

### 5.1 Metric Kunci yang Harus Dipantau

```
KPI-01: Profit per m² per bulan (target: lebih tinggi dari benchmark pasar Rp 38.000/m²)
KPI-02: Warehouse utilization rate (target: >85% dari luas efektif)
KPI-03: Turnover rate per SKU (semakin tinggi = semakin baik untuk fulfillment revenue)
KPI-04: Dead stock ratio (target: <10% dari total volume palet tersimpan)
KPI-05: Client retention rate (target: >80% klien fulfillment perpanjang kontrak)
KPI-06: Revenue mix ratio (monitor apakah proporsi 50:50 masih optimal)
```

---

## 6. Strategic Recommendations

### 6.1 Penetapan Tarif

- Terapkan **tiering pricing** pada fulfillment — jangan flat rate:
  - Barang kecil (< 5 kg / < 30 cm³): tarif dasar
  - Barang sedang (5–20 kg / 30–100 cm³): tarif menengah
  - Barang besar (> 20 kg / > 100 cm³): tarif premium
- Terapkan **minimum billing** untuk klien fulfillment agar staf tetap terbayar walau volume sepi.

### 6.2 Optimalisasi Lahan

- Gunakan **rak multitier** di area fulfillment untuk memaksimalkan jumlah SKU per m².
- Area Sewa Space dapat menggunakan **Floor Stacking** untuk investasi awal lebih rendah.
- Gunakan **Reach Truck** untuk memperketat lebar aisle dan menambah kapasitas palet.

### 6.3 Konversi Klien

- Strategi "upsell path":
  1. Klien masuk via Sewa Space (low friction)
  2. Tawarkan Trial Fulfillment untuk 5 SKU terlaris
  3. Konversi ke layanan Fulfillment penuh setelah klien merasakan kemudahan
- Klien fulfillment yang terintegrasi via API/WMS memiliki **switching cost tinggi** → retensi alami.

### 6.4 Manajemen Dead Stock

- Enforce **Dead Stock Fee**: tarif 2× lipat untuk barang tidak bergerak >90 hari.
- Kirim notifikasi ke klien pada hari ke-60 sebagai *early warning*.
- Tawarkan jasa **pemusnahan atau pengembalian** sebagai layanan berbayar (Expired Fee).

---

## 7. Risk Matrix

| Risiko | Area | Level | Mitigasi |
|---|---|---|---|
| Barang hilang / salah kirim | Fulfillment | Tinggi | WMS ketat, double check picking, CCTV |
| Musim sepi (low season) | Fulfillment | Menengah | Buffer dari Sewa Space (hybrid protection) |
| Klien tidak bayar | Semua | Menengah | Kontrak dengan deposit + terms pembayaran |
| Kerusakan bangunan / bencana | Sewa Space | Rendah | Asuransi properti + asuransi barang klien |
| Overload kapasitas | Semua | Menengah | Monitor KPI-02 utilization rate secara real-time |
| Dead stock menumpuk | Sewa Space | Tinggi | Enforce Dead Stock Fee, laporan 60 hari |
| Staf tidak terlatih | Fulfillment | Tinggi | SOP tertulis, training berkala, WMS onboarding |

---

## 8. System Requirements (for AI/Developer Reference)

### 8.1 Fitur Minimum WMS yang Dibutuhkan

- Manajemen inbound (penerimaan, QC, labeling, barcode scan)
- Manajemen outbound (picking list, packing confirmation, manifes)
- Storage tracking per palet / per SKU
- Dead stock aging report (flagging >60 hari, enforcement >90 hari)
- Billing module: kalkulasi otomatis per fee type (inbound, outbound, storage, return, expired, withdrawal)
- Client portal: akses real-time stok per klien
- API integration untuk koneksi ke sistem klien (e-commerce platform, ERP)

### 8.2 Data Entities Utama

```
Entitas Inti:
- Warehouse (id, name, total_area_m2, effective_area_m2, zone_type: [space|fulfillment])
- Client (id, name, type: [regular|group], contract_start, contract_end, billing_scheme)
- Pallet (id, client_id, sku_id, position, inbound_date, last_move_date, status: [active|dead_stock])
- SKU (id, client_id, name, weight_kg, dimension_cm3, category: [small|medium|large])
- Transaction (id, type: [inbound|outbound|return|expired|withdrawal], pallet_id, timestamp, fee_charged)
- Invoice (id, client_id, period, line_items[], total_amount, status: [draft|sent|paid])
```

### 8.3 Business Logic Pseudocode

```python
# Dead Stock Fee Enforcement
def calculate_storage_fee(pallet, billing_date):
    days_stored = (billing_date - pallet.last_move_date).days
    base_rate = get_client_rate(pallet.client_id)  # Reguler: 38.000, Group: 36.000
    if days_stored > 90:
        return base_rate * 2  # Dead Stock penalty
    elif days_stored > 60:
        send_dead_stock_warning(pallet.client_id, pallet.id)
        return base_rate
    else:
        return base_rate

# Tiering Fee for Fulfillment
def get_pick_pack_fee(sku):
    if sku.category == "small":
        return BASE_PICK_PACK_FEE
    elif sku.category == "medium":
        return BASE_PICK_PACK_FEE * 1.5
    elif sku.category == "large":
        return BASE_PICK_PACK_FEE * 2.0

# Minimum Billing Check
def apply_minimum_billing(client_id, calculated_fee, period):
    min_billing = get_minimum_billing_threshold(client_id)
    return max(calculated_fee, min_billing)
```

---

## 9. Decision Framework for AI Agent

Ketika AI agent diminta membuat keputusan terkait bisnis ini, gunakan urutan logika berikut:

```
1. Identifikasi tipe klien → [Reguler | Group]
2. Identifikasi skema layanan → [Sewa Space | Fulfillment | Hybrid]
3. Hitung luas efektif berdasarkan rasio efisiensi (60%–70%)
4. Pilih metode penyimpanan → [Floor Stacking | Racking System]
5. Terapkan tarif sesuai business rules (RULE-SEWA-xx atau RULE-FF-xx)
6. Periksa kondisi dead stock (>90 hari → 2× tarif)
7. Terapkan minimum billing jika total fee < threshold
8. Output: Breakdown pendapatan kotor, beban operasional, profit bersih
```

---

*Dokumen ini dihasilkan dari: `Strategi_Hybrid_Warehouse__Fulfillment_.docx`*
*Versi: 1.0 | Status: Grounding Document — AI Reference*

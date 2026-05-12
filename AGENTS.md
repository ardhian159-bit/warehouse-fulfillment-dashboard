<!-- BEGIN:nextjs-agent-rules -->
# AGENT.md — Hybrid Warehouse Fulfillment Dashboard

## Project Overview

This is a **frontend prototype** (no backend) for a Hybrid Warehouse Fulfillment Management System built for PT Wikrama Dharma Tunggadewa, located in Jombang, East Java. The client is PT Intan Pariwara.

All data comes from **static mock JSON files** in `src/data/mock/`. There is no database, no auth, and no API calls. This is a portfolio prototype.

---

## Business Model (Read This First)

This warehouse runs **two revenue streams simultaneously (50/50 split)**:

### 1. Sewa Space (Space Rental) — Passive Income
- Rent warehouse floor/rack space per m² per month
- Client manages their own operations
- Stable income, low margin
- Rate: Rp 38,000/m²/month (Reguler), Rp 36,000/m²/month (Group)

### 2. Jasa Fulfillment (Fulfillment Service) — Active Income
- Full end-to-end warehouse operations for client
- Charge per activity — 7 fee components:
  1. **Inbound Fee** — per batch received (Rp 100,000/batch)
  2. **Storage Fee** — per m² per month
  3. **Outbound Fee** — per order shipped (Rp 2,500/order)
  4. **Picking & Packing Fee** — per item processed (Rp 2,000/item)
  5. **Return Fee** — per returned item (Rp 2,000/item)
  6. **Expired Fee** — per expired/destroyed item (Rp 2,000/item)
  7. **Withdrawal Fee** — per pallet withdrawn (Rp 500/pallet)
- High margin, scalable
- Target clients: online shops, D2C brands, SMEs

### Key Financial Context
- Warehouse effective area: 720 m² (60% of 1,200 m² total)
- Rack levels: 3
- Fulfillment profit: ~Rp 156,492,000/month
- Space rental profit: ~Rp 39,960,000/month
- Fulfillment generates 2x more profit with same floor space

### Client Types
- `space` — rents space only
- `fulfillment` — uses full fulfillment service
- `hybrid` — uses both

### Contract Types
- `reguler` — standard pricing
- `group` — slightly discounted (group/corporate client)

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui v4 (Nova preset — Lucide icons + Geist font)
- **Charts**: Recharts
- **Tables**: @tanstack/react-table
- **Icons**: lucide-react
- **Data**: Static mock JSON (no backend)
- **Deploy**: Vercel

---

## Next.js 16 Rules (Critical)

Always follow these — breaking changes from previous versions:

```typescript
// ✅ CORRECT — params must be async
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}

// ✅ CORRECT — cookies and headers must be async
import { cookies, headers } from 'next/headers'
const cookieStore = await cookies()
const headersList = await headers()

// ✅ CORRECT — use proxy.ts not middleware.ts
// rename middleware.ts → proxy.ts

// ✅ CORRECT — Turbopack is default, no config needed
```

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    → redirect to /dashboard
│   ├── dashboard/
│   │   └── page.tsx               → main overview
│   ├── clients/
│   │   ├── page.tsx               → client list
│   │   └── [id]/
│   │       └── page.tsx           → client detail
│   ├── inventory/
│   │   └── page.tsx               → SKU stock monitoring
│   └── billing/
│       └── page.tsx               → monthly billing simulation
├── components/
│   ├── ui/                        → shadcn components (do not edit)
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   └── dashboard/
│       ├── stats-card.tsx
│       ├── operational-flow.tsx
│       ├── revenue-chart.tsx
│       └── stock-table.tsx
├── data/
│   └── mock/
│       ├── clients.json
│       ├── skus.json
│       ├── transactions.json
│       └── billing.json
├── lib/
│   └── utils.ts
└── types/
    └── index.ts
```

---

## TypeScript Types

Always use these types. Do not invent new ones.

```typescript
// src/types/index.ts

export type ClientType = 'space' | 'fulfillment' | 'hybrid'
export type ContractType = 'reguler' | 'group'
export type ClientStatus = 'active' | 'inactive'

export interface Client {
  id: string
  name: string
  type: ClientType
  contractType: ContractType
  contactPerson: string
  phone: string
  address: string
  areaM2: number
  rackLevels: number
  ratePerM2: number
  status: ClientStatus
  joinDate: string
}

export type StockStatus = 'aman' | 'menipis' | 'kritis'
export type SkuCategory = 'buku' | 'atk' | 'modul_digital' | 'elektronik' | 'lainnya'

export interface SKU {
  id: string
  clientId: string
  skuCode: string
  name: string
  category: SkuCategory
  unit: string
  stockQty: number
  minStock: number
  status: StockStatus
  lastUpdated: string
}

export type OrderStatus = 'pending' | 'picking' | 'packing' | 'shipped' | 'cancelled'
export type TransactionType = 'inbound' | 'outbound' | 'return' | 'withdrawal' | 'expired'

export interface Transaction {
  id: string
  clientId: string
  skuId: string
  type: TransactionType
  qty: number
  fee: number
  status: OrderStatus
  date: string
  notes?: string
}

export interface BillingItem {
  id: string
  clientId: string
  billingMonth: string           // format: "2025-05"
  storageFee: number
  inboundFee: number
  outboundFee: number
  pickingPackingFee: number
  returnFee: number
  expiredFee: number
  withdrawalFee: number
  deadStockFee: number
  totalFee: number
  status: 'draft' | 'sent' | 'paid'
}

export interface OperationalFlow {
  barangMasuk: number
  picking: number
  packing: number
  siapKirim: number
}

export interface DashboardStats {
  totalOrderHariIni: number
  orderDiproses: number
  orderTerkirim: number
  kapasitasGudang: number        // percentage 0-100
  flow: OperationalFlow
}
```

---

## UI & Design Rules

- **Language**: All UI text in Bahasa Indonesia
- **Color for status**:
  - `aman` → green (badge variant: `default` with green)
  - `menipis` → yellow (badge variant: `secondary`)
  - `kritis` → red (badge variant: `destructive`)
- **Currency format**: Always use `Intl.NumberFormat('id-ID')` for Rupiah
- **Date format**: `dd MMMM yyyy` in Indonesian locale
- **Numbers**: Use thousand separators (1.248, not 1248)
- **Sidebar navigation**:
  - Dashboard (LayoutDashboard icon)
  - Klien (Users icon)
  - Inventori (Package icon)
  - Billing (FileText icon)
- **Charts**: Use Recharts with Indonesian labels
- **Tables**: Use @tanstack/react-table for sortable/filterable tables
- **No auth UI** — this is a prototype, skip login pages entirely

---

## Currency Helper

Always use this for formatting Rupiah:

```typescript
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}
```

---

## Billing Calculation Logic

Use this exact formula for billing simulation:

```typescript
export function calculateBilling(
  client: Client,
  transactions: Transaction[],
  month: string
): BillingItem {
  const monthTransactions = transactions.filter(
    t => t.clientId === client.id && t.date.startsWith(month)
  )

  const storageFee = client.areaM2 * client.rackLevels * client.ratePerM2
  const inboundFee = monthTransactions.filter(t => t.type === 'inbound').reduce((sum, t) => sum + t.fee, 0)
  const outboundFee = monthTransactions.filter(t => t.type === 'outbound').reduce((sum, t) => sum + t.fee, 0)
  const pickingPackingFee = monthTransactions.filter(t => t.type === 'outbound').reduce((sum, t) => sum + (t.qty * 2000), 0)
  const returnFee = monthTransactions.filter(t => t.type === 'return').reduce((sum, t) => sum + t.fee, 0)
  const expiredFee = monthTransactions.filter(t => t.type === 'expired').reduce((sum, t) => sum + t.fee, 0)
  const withdrawalFee = monthTransactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.fee, 0)
  const deadStockFee = 0 // calculated separately based on 90-day threshold

  return {
    id: `bill-${client.id}-${month}`,
    clientId: client.id,
    billingMonth: month,
    storageFee,
    inboundFee,
    outboundFee,
    pickingPackingFee,
    returnFee,
    expiredFee,
    withdrawalFee,
    deadStockFee,
    totalFee: storageFee + inboundFee + outboundFee + pickingPackingFee + returnFee + expiredFee + withdrawalFee + deadStockFee,
    status: 'draft'
  }
}
```

---

## Component Conventions

```typescript
// Always use named exports for components
export function StatsCard({ title, value, growth }: StatsCardProps) {}

// Always define Props type above component
interface StatsCardProps {
  title: string
  value: string | number
  growth?: number
}

// Always use 'use client' only when needed (interactivity/hooks)
// Server components by default in App Router

// Data fetching pattern for mock data
import clientsData from '@/data/mock/clients.json'
const clients: Client[] = clientsData as Client[]
```

---

## What NOT To Build

- No login/auth pages
- No API routes
- No database connections
- No real payment integration
- No backend whatsoever
- No middleware/proxy.ts (not needed for prototype)
- No multi-user role switching

---

## Pages Scope (MVP Only)

### /dashboard
- Stats cards: Total Order, Diproses, Terkirim, Kapasitas Gudang
- Operational flow: Barang Masuk → Picking → Packing → Siap Kirim
- Revenue comparison chart: Sewa Space vs Fulfillment (bar chart)
- Stock alert: SKU with status kritis/menipis

### /clients
- Table: semua klien dengan type, contract, area, status
- Filter by type (space/fulfillment/hybrid)
- Click → detail klien

### /clients/[id]
- Info klien
- SKU list milik klien
- Transaction history
- Billing summary bulan ini

### /inventory
- Table semua SKU dengan stock, status, klien
- Filter by status (aman/menipis/kritis)
- Search by nama produk

### /billing
- Select bulan
- Table billing per klien
- Total revenue breakdown
- Badge status (draft/sent/paid)



This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

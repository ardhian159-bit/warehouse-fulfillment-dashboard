// ── Client ────────────────────────────────────────────────────────────────────

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
  contractStart: string
  contractEnd: string
  minimumBilling: number
}

// ── SKU ───────────────────────────────────────────────────────────────────────

export type StockStatus = 'aman' | 'menipis' | 'kritis'
export type SkuCategory = 'buku' | 'atk' | 'modul_digital' | 'elektronik' | 'lainnya'
export type SkuSizeCategory = 'small' | 'medium' | 'large'

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
  weightKg: number
  dimensionCm3: number
  sizeCategory: SkuSizeCategory
}

// ── Transaction ───────────────────────────────────────────────────────────────

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

// ── Billing ───────────────────────────────────────────────────────────────────

export type BillingStatus = 'draft' | 'sent' | 'paid'

export interface BillingItem {
  id: string
  clientId: string
  billingMonth: string
  storageFee: number
  inboundFee: number
  outboundFee: number
  pickingPackingFee: number
  returnFee: number
  expiredFee: number
  withdrawalFee: number
  deadStockFee: number
  totalFee: number
  minimumBillingApplied: boolean
  status: BillingStatus
}

// ── Warehouse ─────────────────────────────────────────────────────────────────

export type WarehouseZoneType = 'space' | 'fulfillment'

export interface WarehouseZone {
  id: string
  name: string
  zoneType: WarehouseZoneType
  areaM2: number
}

export interface WarehouseConfig {
  id: string
  name: string
  totalAreaM2: number
  effectiveAreaM2: number
  efficiencyRatio: number
  zones: WarehouseZone[]
}

// ── Pallet ────────────────────────────────────────────────────────────────────

export type PalletStatus = 'active' | 'dead_stock'

export interface Pallet {
  id: string
  clientId: string
  skuId: string
  zone: WarehouseZoneType
  position: string
  inboundDate: string
  lastMoveDate: string
  qty: number
  status: PalletStatus
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

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
  kapasitasGudang: number
  flow: OperationalFlow
}

// ── Fulfillment Operations ────────────────────────────────────────────────────

export type InboundStatus = 'diterima' | 'selesai'

export interface InboundRecord {
  id: string
  clientId: string
  clientName: string
  skuId: string
  skuName: string
  batchCode: string
  qtyPallet: number
  qtyUnit: number
  notes: string
  receivedAt: string
  status: InboundStatus
}

export type OutboundStatus = 'pending' | 'picking' | 'packing' | 'siap_kirim' | 'terkirim'

export interface OutboundRecord {
  id: string
  clientId: string
  clientName: string
  skuId: string
  skuName: string
  orderRef: string
  destination: string
  courier: string
  qty: number
  status: OutboundStatus
  createdAt: string
  shippedAt?: string
}

export type ReturnStatus = 'diterima' | 'diproses' | 'selesai'

export interface ReturnRecord {
  id: string
  clientId: string
  clientName: string
  skuId: string
  skuName: string
  orderRef: string
  reason: string
  qtyReturned: number
  status: ReturnStatus
  createdAt: string
}

export type WithdrawalStatus = 'pending' | 'diproses' | 'selesai'

export interface WithdrawalRecord {
  id: string
  clientId: string
  clientName: string
  skuId: string
  skuName: string
  qtyPallet: number
  qtyUnit: number
  notes: string
  requestedAt: string
  status: WithdrawalStatus
}

export type ExpiredStatus = 'pending' | 'selesai'
export type ExpiredAction = 'pemusnahan' | 'pengembalian'

export interface ExpiredRecord {
  id: string
  clientId: string
  clientName: string
  skuId: string
  skuName: string
  qty: number
  action: ExpiredAction
  notes: string
  handledAt: string
  status: ExpiredStatus
}

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
  kapasitasGudang: number
  flow: OperationalFlow
}

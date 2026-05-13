import type {
  BillingItem,
  ClientStatus,
  ClientType,
  ContractType,
  OrderStatus,
  PalletStatus,
  SKU,
  SkuSizeCategory,
  StockStatus,
  Transaction,
} from "@/types"

// ── Client Type ──────────────────────────────────────────────────────────────

export const clientTypeLabels: Record<ClientType, string> = {
  space: "Space",
  fulfillment: "Fulfillment",
  hybrid: "Hybrid",
}

export function getClientTypeBadgeClass(type: ClientType): string {
  if (type === "space") {
    return "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100/80"
  }

  if (type === "fulfillment") {
    return "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100/80"
  }

  return "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100/80"
}

// ── Contract Type ────────────────────────────────────────────────────────────

export const contractTypeLabels: Record<ContractType, string> = {
  reguler: "Reguler",
  group: "Group",
}

export function getContractBadgeClass(contractType: ContractType): string {
  if (contractType === "group") {
    return "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100/80"
  }

  return "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200/80"
}

// ── Client Status ────────────────────────────────────────────────────────────

export const clientStatusLabels: Record<ClientStatus, string> = {
  active: "Aktif",
  inactive: "Tidak Aktif",
}

export function getClientStatusBadgeClass(status: ClientStatus): string {
  if (status === "active") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80"
  }

  return "border-red-200 bg-red-50 text-red-700 hover:bg-red-100/80"
}

// ── Stock Status ─────────────────────────────────────────────────────────────

export const stockStatusLabels: Record<StockStatus, string> = {
  aman: "Aman",
  menipis: "Menipis",
  kritis: "Kritis",
}

export function getStockBadgeClass(status: SKU["status"]): string {
  if (status === "kritis") {
    return "border-red-200 bg-red-50 text-red-700 hover:bg-red-100/80"
  }

  if (status === "menipis") {
    return "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100/80"
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80"
}

// ── Transaction Type ─────────────────────────────────────────────────────────

export const transactionTypeLabels: Record<Transaction["type"], string> = {
  inbound: "Inbound",
  outbound: "Outbound",
  return: "Retur",
  withdrawal: "Withdrawal",
  expired: "Expired",
}

export function getTransactionTypeBadgeClass(type: Transaction["type"]): string {
  switch (type) {
    case "inbound":
      return "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100/80"
    case "outbound":
      return "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100/80"
    case "return":
      return "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100/80"
    case "expired":
      return "border-red-200 bg-red-50 text-red-700 hover:bg-red-100/80"
    case "withdrawal":
      return "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200/80"
    default:
      return ""
  }
}

// ── Order Status ─────────────────────────────────────────────────────────────

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Menunggu",
  picking: "Picking",
  packing: "Packing",
  shipped: "Terkirim",
  cancelled: "Dibatalkan",
}

export function getOrderStatusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200/80"
    case "picking":
      return "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100/80"
    case "packing":
      return "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100/80"
    case "shipped":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80"
    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700 hover:bg-red-100/80"
    default:
      return ""
  }
}

// ── Billing Status ───────────────────────────────────────────────────────────

export const billingStatusLabels: Record<BillingItem["status"], string> = {
  paid: "Lunas",
  sent: "Terkirim",
  draft: "Draft",
}

export function getBillingStatusBadgeClass(status: BillingItem["status"]): string {
  if (status === "paid") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80"
  }

  if (status === "sent") {
    return "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100/80"
  }

  return "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200/80"
}

// ── SKU Category ─────────────────────────────────────────────────────────────

export const skuCategoryLabels: Record<SKU["category"], string> = {
  buku: "Buku",
  atk: "ATK",
  modul_digital: "Modul Digital",
  elektronik: "Elektronik",
  lainnya: "Lainnya",
}

// ── SKU Size Category ────────────────────────────────────────────────────────

export const skuSizeCategoryLabels: Record<SkuSizeCategory, string> = {
  small: "Kecil",
  medium: "Sedang",
  large: "Besar",
}

export function getSkuSizeBadgeClass(size: SkuSizeCategory): string {
  if (size === "small") {
    return "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100/80"
  }

  if (size === "medium") {
    return "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100/80"
  }

  return "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100/80"
}

// ── Pallet Status ────────────────────────────────────────────────────────────

export const palletStatusLabels: Record<PalletStatus, string> = {
  active: "Aktif",
  dead_stock: "Dead Stock",
}

export function getPalletStatusBadgeClass(status: PalletStatus): string {
  if (status === "active") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80"
  }

  return "border-red-200 bg-red-50 text-red-700 hover:bg-red-100/80"
}

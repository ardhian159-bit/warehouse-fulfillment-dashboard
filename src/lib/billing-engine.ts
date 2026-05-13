/**
 * billing-engine.ts — Core business logic for the Hybrid Warehouse billing system.
 *
 * Implements three critical functions from the grounding document:
 *   A. Dead Stock Fee Enforcement (RULE-SEWA-06)
 *   B. Tiering Fee per SKU Size (RULE-FF-08)
 *   C. Minimum Billing Check (RULE-FF-09)
 */

import type {
  BillingItem,
  Client,
  Pallet,
  SKU,
  SkuSizeCategory,
  Transaction,
} from "@/types"

// ── Constants ─────────────────────────────────────────────────────────────────

/** Base picking & packing fee in Rupiah (RULE-FF-04) */
export const BASE_PICK_PACK_FEE = 2000

/** Dead stock warning threshold in days (grounding doc §6.4) */
export const DEAD_STOCK_WARNING_DAYS = 60

/** Dead stock penalty threshold in days (RULE-SEWA-06) */
export const DEAD_STOCK_PENALTY_DAYS = 90

/** Tiering multipliers per SKU size category (RULE-FF-08, grounding doc §6.1) */
export const SIZE_MULTIPLIERS: Record<SkuSizeCategory, number> = {
  small: 1.0,
  medium: 1.5,
  large: 2.0,
}

// ── Utility ───────────────────────────────────────────────────────────────────

/** Calculate the number of days between two ISO date strings. */
export function diffDays(fromDate: string, toDate: string): number {
  const from = new Date(fromDate)
  const to = new Date(toDate)
  const diffMs = to.getTime() - from.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}

// ── A. Dead Stock Fee Enforcement (RULE-SEWA-06) ─────────────────────────────

export interface DeadStockResult {
  fee: number
  daysStored: number
  isDeadStock: boolean
  isWarning: boolean
}

/**
 * Calculate storage fee for a single pallet, applying dead stock penalty.
 *
 * - >90 days since last move → 2× rate (RULE-SEWA-06)
 * - >60 days → warning (grounding doc §6.4), base rate
 * - ≤60 days → base rate
 */
export function calculatePalletStorageFee(
  pallet: Pallet,
  billingDate: string,
  clientRatePerM2: number
): DeadStockResult {
  const daysStored = diffDays(pallet.lastMoveDate, billingDate)
  const isDeadStock = daysStored > DEAD_STOCK_PENALTY_DAYS
  const isWarning =
    daysStored > DEAD_STOCK_WARNING_DAYS &&
    daysStored <= DEAD_STOCK_PENALTY_DAYS
  const fee = isDeadStock ? clientRatePerM2 * 2 : clientRatePerM2

  return { fee, daysStored, isDeadStock, isWarning }
}

/**
 * Get all pallets that are in warning (>60 days) or penalty (>90 days) zone.
 */
export function getDeadStockAlerts(
  pallets: Pallet[],
  billingDate: string,
  clientRatePerM2Map: Map<string, number>
): Array<Pallet & DeadStockResult> {
  return pallets
    .map((pallet) => {
      const rate = clientRatePerM2Map.get(pallet.clientId) ?? 38000
      const result = calculatePalletStorageFee(pallet, billingDate, rate)
      return { ...pallet, ...result }
    })
    .filter((item) => item.isWarning || item.isDeadStock)
    .sort((a, b) => b.daysStored - a.daysStored)
}

// ── B. Tiering Fee per SKU Size (RULE-FF-08) ─────────────────────────────────

/**
 * Get the tiered picking & packing fee for a given SKU size category.
 *
 * - small (<5 kg / <30 cm³):   1× base = Rp 2.000
 * - medium (5–20 kg / 30–100): 1.5× base = Rp 3.000
 * - large (>20 kg / >100):     2× base = Rp 4.000
 */
export function getPickPackFee(sizeCategory: SkuSizeCategory): number {
  return BASE_PICK_PACK_FEE * SIZE_MULTIPLIERS[sizeCategory]
}

/**
 * Get human-readable label for the size multiplier.
 */
export function getSizeMultiplierLabel(sizeCategory: SkuSizeCategory): string {
  const multiplier = SIZE_MULTIPLIERS[sizeCategory]
  return `${multiplier}×`
}

// ── C. Minimum Billing Check (RULE-FF-09) ────────────────────────────────────

/**
 * Apply minimum billing threshold. Returns the greater of the calculated fee
 * or the client's minimum billing threshold.
 */
export function applyMinimumBilling(
  calculatedFee: number,
  minimumBilling: number
): { finalFee: number; applied: boolean } {
  if (minimumBilling <= 0) {
    return { finalFee: calculatedFee, applied: false }
  }

  const applied = calculatedFee < minimumBilling
  return {
    finalFee: Math.max(calculatedFee, minimumBilling),
    applied,
  }
}

// ── D. Full Billing Calculation ──────────────────────────────────────────────

/**
 * Calculate the complete billing for a client in a given month.
 *
 * This replaces the static billing.json with a runtime calculation
 * that incorporates dead stock fees, tiering, and minimum billing.
 */
export function calculateClientBilling(
  client: Client,
  transactions: Transaction[],
  pallets: Pallet[],
  skus: SKU[],
  month: string
): BillingItem {
  const skuMap = new Map(skus.map((sku) => [sku.id, sku]))
  const billingDate = `${month}-28` // end of billing period

  // Filter transactions for this client and month
  const monthTransactions = transactions.filter(
    (t) => t.clientId === client.id && t.date.startsWith(month)
  )

  // Storage fee: area × rack levels × rate
  const storageFee = client.areaM2 * client.rackLevels * client.ratePerM2

  // Inbound fee: sum of all inbound transaction fees
  const inboundFee = monthTransactions
    .filter((t) => t.type === "inbound")
    .reduce((sum, t) => sum + t.fee, 0)

  // Outbound fee: sum of all outbound transaction fees
  const outboundFee = monthTransactions
    .filter((t) => t.type === "outbound")
    .reduce((sum, t) => sum + t.fee, 0)

  // Picking & packing fee: tiered by SKU size (RULE-FF-08)
  const pickingPackingFee = monthTransactions
    .filter((t) => t.type === "outbound")
    .reduce((sum, t) => {
      const sku = skuMap.get(t.skuId)
      const unitFee = sku ? getPickPackFee(sku.sizeCategory) : BASE_PICK_PACK_FEE
      return sum + t.qty * unitFee
    }, 0)

  // Return fee
  const returnFee = monthTransactions
    .filter((t) => t.type === "return")
    .reduce((sum, t) => sum + t.fee, 0)

  // Expired fee
  const expiredFee = monthTransactions
    .filter((t) => t.type === "expired")
    .reduce((sum, t) => sum + t.fee, 0)

  // Withdrawal fee
  const withdrawalFee = monthTransactions
    .filter((t) => t.type === "withdrawal")
    .reduce((sum, t) => sum + t.fee, 0)

  // Dead stock fee: penalty on pallets not moved >90 days (RULE-SEWA-06)
  const clientPallets = pallets.filter((p) => p.clientId === client.id)
  const deadStockFee = clientPallets.reduce((sum, pallet) => {
    const result = calculatePalletStorageFee(
      pallet,
      billingDate,
      client.ratePerM2
    )
    // Only add the PENALTY PORTION (the extra 1× on top of the normal rate)
    if (result.isDeadStock) {
      return sum + client.ratePerM2
    }
    return sum
  }, 0)

  // Sum all fees before minimum billing
  const calculatedTotal =
    storageFee +
    inboundFee +
    outboundFee +
    pickingPackingFee +
    returnFee +
    expiredFee +
    withdrawalFee +
    deadStockFee

  // Apply minimum billing (RULE-FF-09)
  const { finalFee, applied } = applyMinimumBilling(
    calculatedTotal,
    client.minimumBilling
  )

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
    totalFee: finalFee,
    minimumBillingApplied: applied,
    status: "draft",
  }
}

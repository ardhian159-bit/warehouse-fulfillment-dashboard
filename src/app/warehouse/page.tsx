"use client"

import { useMemo, useState } from "react"
import { CheckSquare, Map, Warehouse } from "lucide-react"

import clientsData from "@/data/mock/clients.json"
import palletsData from "@/data/mock/pallets.json"
import skusData from "@/data/mock/skus.json"
import warehouseData from "@/data/mock/warehouse.json"
import { diffDays, DEAD_STOCK_PENALTY_DAYS, DEAD_STOCK_WARNING_DAYS } from "@/lib/billing-engine"
import { cn, formatNumber } from "@/lib/utils"
import type { Client, ClientType, Pallet, SKU, WarehouseConfig } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const clients: Client[] = clientsData as Client[]
const skus: SKU[] = skusData as SKU[]
const realPallets: Pallet[] = palletsData as Pallet[]
const warehouseConfig = warehouseData as WarehouseConfig
const BILLING_DATE = "2025-05-10"

type PalletStatus = "kosong" | "terisi" | "penuh" | "dead_stock"

interface PalletCell {
  id: string
  zone: "Area Sewa Space" | "Area Fulfillment"
  row: number
  col: number
  status: PalletStatus
  clientName?: string
  skuName?: string
  qty?: number
  daysStored?: number
}

interface HoverState {
  cell: PalletCell
  zone: PalletCell["zone"]
  left: number
  top: number
}

const ZONE_CONFIG = [
  {
    zone: "Area Sewa Space" as const,
    areaLabel: "360 m²",
    statusCounts: {
      terisi: 43,
      penuh: 5,
      kosong: 12,
      dead_stock: 10,
    },
    allowedClientTypes: ["space", "hybrid"] as ClientType[],
  },
  {
    zone: "Area Fulfillment" as const,
    areaLabel: "360 m²",
    statusCounts: {
      terisi: 42,
      penuh: 5,
      kosong: 15,
      dead_stock: 8,
    },
    allowedClientTypes: ["fulfillment", "hybrid"] as ClientType[],
  },
]

const statusLabels: Record<PalletStatus, string> = {
  kosong: "Kosong",
  terisi: "Terisi",
  penuh: "Penuh",
  dead_stock: "Dead Stock",
}

function createZoneCells(
  zone: (typeof ZONE_CONFIG)[number],
  clientPool: Client[],
  skuPool: SKU[]
): PalletCell[] {
  const clientLookup = new globalThis.Map(clientPool.map((c) => [c.id, c]))
  const skuLookup = new globalThis.Map(skuPool.map((s) => [s.id, s]))
  const zoneType = zone.zone === "Area Sewa Space" ? "space" : "fulfillment"

  // Map real pallet data into the first N cells of this zone
  const zonePallets = realPallets.filter((p) => p.zone === zoneType)
  const realCells: PalletCell[] = zonePallets.map((p, index) => {
    const days = diffDays(p.lastMoveDate, BILLING_DATE)
    const row = Math.floor(index / 10) + 1
    const col = (index % 10) + 1
    let status: PalletStatus = "terisi"
    if (days > DEAD_STOCK_PENALTY_DAYS) status = "dead_stock"
    else if (p.qty > 150) status = "penuh"

    return {
      id: p.position,
      zone: zone.zone,
      row,
      col,
      status,
      clientName: clientLookup.get(p.clientId)?.name,
      skuName: skuLookup.get(p.skuId)?.name,
      qty: p.qty,
      daysStored: days,
    }
  })

  // Fill remaining grid cells with generated data to reach 70 cells total
  const remaining = 70 - realCells.length
  const statuses: PalletStatus[] = [
    ...Array.from({ length: Math.max(0, zone.statusCounts.terisi - zonePallets.filter((p) => diffDays(p.lastMoveDate, BILLING_DATE) <= DEAD_STOCK_PENALTY_DAYS && p.qty <= 150).length) }, () => "terisi" as const),
    ...Array.from({ length: zone.statusCounts.penuh }, () => "penuh" as const),
    ...Array.from({ length: zone.statusCounts.kosong }, () => "kosong" as const),
  ]

  const zoneClients = clientPool.filter((client) =>
    zone.allowedClientTypes.includes(client.type)
  )
  const zoneSkus = skuPool.filter((sku) =>
    zoneClients.some((client) => client.id === sku.clientId)
  )

  const generatedCells: PalletCell[] = Array.from({ length: remaining }, (_, i) => {
    const index = realCells.length + i
    const row = Math.floor(index / 10) + 1
    const col = (index % 10) + 1
    const status = statuses[i % statuses.length] ?? "kosong"
    const client = zoneClients[i % zoneClients.length]
    const clientSkus = zoneSkus.filter((sku) => sku.clientId === client?.id)
    const sku = clientSkus[(row + col + i) % clientSkus.length] ?? zoneSkus[i % zoneSkus.length]
    const baseQty = sku?.stockQty ?? 0
    const qty = status === "penuh" ? Math.max(80, Math.round(baseQty * 0.08)) : Math.max(24, Math.round(baseQty * 0.04))

    return {
      id: `gen-${String.fromCharCode(65 + row - 1)}-${String(col).padStart(2, "0")}`,
      zone: zone.zone,
      row,
      col,
      status,
      clientName: status === "kosong" ? undefined : client?.name,
      skuName: status === "kosong" ? undefined : sku?.name,
      qty: status === "kosong" ? undefined : qty,
    }
  })

  return [...realCells, ...generatedCells]
}

function getCellClassName(status: PalletStatus): string {
  if (status === "terisi") {
    return "border border-emerald-400/60 bg-emerald-400 shadow-sm shadow-emerald-400/20"
  }

  if (status === "penuh") {
    return "border border-rose-500/60 bg-rose-500 shadow-sm shadow-rose-500/20"
  }

  if (status === "dead_stock") {
    return "border border-orange-500/60 bg-orange-500 shadow-sm shadow-orange-500/20"
  }

  return "border border-slate-200/80 bg-slate-100"
}

function getTooltipStatusClass(status: PalletStatus): string {
  if (status === "terisi") return "text-emerald-700"
  if (status === "penuh") return "text-rose-700"
  if (status === "dead_stock") return "text-orange-700"
  return "text-slate-600"
}

function getStatusDotClass(status: PalletStatus): string {
  if (status === "terisi") return "bg-emerald-500"
  if (status === "penuh") return "bg-rose-500"
  if (status === "dead_stock") return "bg-orange-500"
  return "bg-slate-400"
}

export default function WarehousePage() {
  const [hoveredCell, setHoveredCell] = useState<HoverState | null>(null)

  const palletCells = useMemo(() => {
    return ZONE_CONFIG.flatMap((zone) => createZoneCells(zone, clients, skus))
  }, [])

  const groupedZones = useMemo(
    () =>
      ZONE_CONFIG.map((zone) => ({
        ...zone,
        cells: palletCells.filter((cell) => cell.zone === zone.zone),
      })),
    [palletCells]
  )

  const totalCells = palletCells.length
  const occupiedCount = palletCells.filter((cell) => cell.status !== "kosong").length
  const occupancyCount = palletCells.filter(
    (cell) => cell.status === "terisi" || cell.status === "penuh"
  ).length
  const deadStockCount = palletCells.filter((cell) => cell.status === "dead_stock").length
  const emptyCount = palletCells.filter((cell) => cell.status === "kosong").length
  const occupancyPercentage = totalCells > 0 ? (occupancyCount / totalCells) * 100 : 0

  const summaryCards = [
    { label: "Total Kapasitas", value: `${formatNumber(warehouseConfig.effectiveAreaM2)} m²`, icon: Warehouse, iconClass: "from-blue-50 to-blue-100 text-blue-700", accent: "border-l-blue-500" },
    { label: "Terpakai", value: `${formatNumber(occupiedCount)} sel`, icon: Map, iconClass: "from-emerald-50 to-emerald-100 text-emerald-700", accent: "border-l-emerald-500" },
    { label: "Dead Stock", value: `${formatNumber(deadStockCount)} sel`, icon: Map, iconClass: "from-red-50 to-red-100 text-red-600", accent: "border-l-red-500", valueClass: "text-red-700" },
    { label: "Kosong", value: `${formatNumber(emptyCount)} sel`, icon: Map, iconClass: "from-emerald-50 to-emerald-100 text-emerald-700", accent: "border-l-emerald-500", valueClass: "text-emerald-700" },
  ]

  return (
    <section className="space-y-6">
      <div className="space-y-4 animate-fade-in-up">
        <div className="space-y-2">
          <p className="text-sm font-medium text-blue-600">
            <span className="section-dot" />
            Warehouse Map
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Peta Gudang
          </h2>
          <p className="text-sm leading-6 text-slate-600">
            Visualisasi penggunaan ruang — hover sel untuk detail
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="size-3 rounded-sm border border-slate-200 bg-slate-100" />
            Kosong
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="size-3 rounded-sm bg-emerald-400 shadow-sm shadow-emerald-400/30" />
            Terisi
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="size-3 rounded-sm bg-rose-500 shadow-sm shadow-rose-500/30" />
            Penuh
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="size-3 rounded-sm bg-orange-500 shadow-sm shadow-orange-500/30" />
            Dead Stock
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        {groupedZones.map((zone) => {
          const zoneCounts = {
            terisi: zone.cells.filter((cell) => cell.status === "terisi").length,
            penuh: zone.cells.filter((cell) => cell.status === "penuh").length,
            kosong: zone.cells.filter((cell) => cell.status === "kosong").length,
            dead_stock: zone.cells.filter((cell) => cell.status === "dead_stock").length,
          }

          return (
            <Card
              key={zone.zone}
              className="card-glass animate-fade-in-up"
              style={{ overflow: "visible" }}
            >
              <CardHeader className="border-b border-slate-100/80">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex size-5 items-center justify-center rounded border border-slate-300/60 bg-white text-slate-400">
                      <CheckSquare className="size-3.5" />
                    </span>
                    <div className="space-y-1">
                      <CardTitle>{zone.zone} — {zone.areaLabel}</CardTitle>
                      <p className="text-sm text-slate-500">
                        Zona {zone.zone === "Area Sewa Space" ? "rental space" : "operasional fulfillment"}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 text-slate-600">
                    <Warehouse className="size-4" />
                  </span>
                </div>
              </CardHeader>

              <CardContent className="px-5 py-5">
                <div
                  className="relative"
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(10, 40px)",
                      gap: "6px",
                    }}
                  >
                    {zone.cells.map((cell) => (
                      <button
                        key={`${zone.zone}-${cell.id}`}
                        type="button"
                        className={cn(
                          "relative cursor-pointer rounded-md transition-all duration-150 hover:scale-105 hover:brightness-110",
                          getCellClassName(cell.status)
                        )}
                        style={{ width: "40px", height: "40px" }}
                        onMouseEnter={(event) => {
                          const rect = event.currentTarget.getBoundingClientRect()
                          const parentRect =
                            event.currentTarget.parentElement?.getBoundingClientRect()

                          setHoveredCell({
                            cell,
                            zone: zone.zone,
                            left: rect.left - (parentRect?.left ?? 0) + rect.width / 2,
                            top: rect.top - (parentRect?.top ?? 0) - 12,
                          })
                        }}
                        aria-label={`${cell.id} ${statusLabels[cell.status]}`}
                      />
                    ))}
                  </div>

                  {hoveredCell && hoveredCell.zone === zone.zone ? (
                    <div
                      className="pointer-events-none absolute z-20 w-64 -translate-x-1/2 -translate-y-full rounded-xl border border-slate-200/60 bg-white/95 p-4 shadow-lg backdrop-blur-md"
                      style={{
                        left: hoveredCell.left,
                        top: hoveredCell.top,
                      }}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className={cn("size-2 rounded-full", getStatusDotClass(hoveredCell.cell.status))} />
                          <p className="text-sm font-semibold text-slate-900">
                            {hoveredCell.cell.id}
                          </p>
                        </div>
                        <p
                          className={cn(
                            "text-sm font-medium",
                            getTooltipStatusClass(hoveredCell.cell.status)
                          )}
                        >
                          {statusLabels[hoveredCell.cell.status]}
                        </p>
                        {hoveredCell.cell.clientName ? (
                          <p className="text-sm text-slate-600">
                            Klien: {hoveredCell.cell.clientName}
                          </p>
                        ) : null}
                        {hoveredCell.cell.skuName ? (
                          <p className="text-sm text-slate-600">
                            SKU: {hoveredCell.cell.skuName}
                          </p>
                        ) : null}
                        {hoveredCell.cell.qty ? (
                          <p className="text-sm text-slate-600">
                            Qty: {formatNumber(hoveredCell.cell.qty)}
                          </p>
                        ) : null}
                        {hoveredCell.cell.daysStored != null ? (
                          <p className={cn("text-sm font-medium", hoveredCell.cell.daysStored > DEAD_STOCK_PENALTY_DAYS ? "text-red-600" : hoveredCell.cell.daysStored > DEAD_STOCK_WARNING_DAYS ? "text-amber-600" : "text-slate-500")}>
                            {hoveredCell.cell.daysStored} hari tersimpan
                            {hoveredCell.cell.daysStored > DEAD_STOCK_PENALTY_DAYS ? " · 2× tarif" : hoveredCell.cell.daysStored > DEAD_STOCK_WARNING_DAYS ? " · warning" : ""}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-400" /> {zoneCounts.terisi}</span>
                  <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-rose-500" /> {zoneCounts.penuh}</span>
                  <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-slate-300" /> {zoneCounts.kosong}</span>
                  <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-orange-500" /> {zoneCounts.dead_stock}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        {summaryCards.map((item, index) => {
          const Icon = item.icon
          return (
            <Card key={item.label} className={`card-glass card-hover animate-fade-in-up border-l-4 ${item.accent} stagger-${index + 1}`}>
              <CardContent className="flex items-start gap-4 p-5">
                <div className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.iconClass}`}>
                  <Icon className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                  <p className={`text-2xl font-semibold tracking-tight ${item.valueClass ?? "text-slate-900"}`}>
                    {item.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="card-glass animate-fade-in-up">
        <CardHeader className="border-b border-slate-100/80">
          <CardTitle>
            <span className="section-dot" />
            Tingkat Okupansi Gudang
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 py-5">
          <div className="mb-3 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              Sel terisi dan penuh dibandingkan total kapasitas lokasi pallet
            </p>
            <span className="text-sm font-semibold text-slate-900">
              {occupancyPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-200/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-500 animate-progress-fill transition-all duration-300"
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

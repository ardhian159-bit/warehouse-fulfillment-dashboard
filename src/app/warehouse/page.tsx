"use client"

import { useMemo, useState } from "react"
import { CheckSquare, Map, Warehouse } from "lucide-react"

import clientsData from "@/data/mock/clients.json"
import skusData from "@/data/mock/skus.json"
import { cn, formatNumber } from "@/lib/utils"
import type { Client, ClientType, SKU } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const clients: Client[] = clientsData as Client[]
const skus: SKU[] = skusData as SKU[]

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
  const statuses: PalletStatus[] = [
    ...Array.from({ length: zone.statusCounts.terisi }, () => "terisi" as const),
    ...Array.from({ length: zone.statusCounts.penuh }, () => "penuh" as const),
    ...Array.from({ length: zone.statusCounts.kosong }, () => "kosong" as const),
    ...Array.from({ length: zone.statusCounts.dead_stock }, () => "dead_stock" as const),
  ]

  const zoneClients = clientPool.filter((client) =>
    zone.allowedClientTypes.includes(client.type)
  )
  const zoneSkus = skuPool.filter((sku) =>
    zoneClients.some((client) => client.id === sku.clientId)
  )

  return Array.from({ length: 70 }, (_, index) => {
    const row = Math.floor(index / 10) + 1
    const col = (index % 10) + 1
    const status = statuses[index]
    const client = zoneClients[index % zoneClients.length]
    const clientSkus = zoneSkus.filter((sku) => sku.clientId === client.id)
    const sku = clientSkus[(row + col + index) % clientSkus.length] ?? zoneSkus[index % zoneSkus.length]
    const baseQty = sku?.stockQty ?? 0
    const qty = status === "penuh" ? Math.max(80, Math.round(baseQty * 0.08)) : Math.max(24, Math.round(baseQty * 0.04))

    return {
      id: `${String.fromCharCode(65 + row - 1)}-${String(col).padStart(2, "0")}`,
      zone: zone.zone,
      row,
      col,
      status,
      clientName: status === "kosong" ? undefined : client.name,
      skuName: status === "kosong" ? undefined : sku?.name,
      qty: status === "kosong" ? undefined : qty,
    }
  })
}

function getCellClassName(status: PalletStatus): string {
  if (status === "terisi") {
    return "border border-green-500 bg-green-400"
  }

  if (status === "penuh") {
    return "border border-red-600 bg-red-500"
  }

  if (status === "dead_stock") {
    return "border border-orange-600 bg-orange-500"
  }

  return "border border-slate-200 bg-slate-100"
}

function getTooltipStatusClass(status: PalletStatus): string {
  if (status === "terisi") {
    return "text-green-700"
  }

  if (status === "penuh") {
    return "text-red-700"
  }

  if (status === "dead_stock") {
    return "text-orange-700"
  }

  return "text-slate-600"
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

  return (
    <section className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-indigo-600">Warehouse Map</p>
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
            <span className="size-3 rounded-sm bg-green-400" />
            Terisi
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="size-3 rounded-sm bg-red-500" />
            Penuh
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="size-3 rounded-sm bg-orange-500" />
            Dead Stock
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
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
              className="border border-slate-200 bg-white shadow-none ring-0"
              style={{ overflow: "visible" }}
            >
              <CardHeader className="border-b border-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex size-5 items-center justify-center rounded border border-slate-300 bg-white text-slate-400">
                      <CheckSquare className="size-3.5" />
                    </span>
                    <div className="space-y-1">
                      <CardTitle>{zone.zone} — {zone.areaLabel}</CardTitle>
                      <p className="text-sm text-slate-500">
                        Zona {zone.zone === "Area Sewa Space" ? "rental space" : "operasional fulfillment"}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
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
                          "relative cursor-pointer rounded-md transition-transform duration-150 hover:scale-[1.03]",
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
                      className="pointer-events-none absolute z-20 w-64 -translate-x-1/2 -translate-y-full rounded-xl border border-slate-200 bg-white p-4 shadow-lg"
                      style={{
                        left: hoveredCell.left,
                        top: hoveredCell.top,
                      }}
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {hoveredCell.cell.id}
                        </p>
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
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-600">
                  <span>✓ {zoneCounts.terisi}</span>
                  <span>🔴 {zoneCounts.penuh}</span>
                  <span>□ {zoneCounts.kosong}</span>
                  <span>🟠 {zoneCounts.dead_stock}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        <Card className="border border-slate-200 bg-white shadow-none ring-0">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Warehouse className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Total Kapasitas</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">
                720 m²
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-none ring-0">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-50 text-green-700">
              <Map className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Terpakai</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">
                {formatNumber(occupiedCount)} sel
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-none ring-0">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-50 text-red-700">
              <Map className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Dead Stock</p>
              <p className="text-2xl font-semibold tracking-tight text-red-700">
                {formatNumber(deadStockCount)} sel
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-none ring-0">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Map className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Kosong</p>
              <p className="text-2xl font-semibold tracking-tight text-emerald-700">
                {formatNumber(emptyCount)} sel
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 bg-white shadow-none ring-0">
        <CardHeader className="border-b border-slate-100">
          <CardTitle>Tingkat Okupansi Gudang</CardTitle>
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
          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${occupancyPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Search,
  ShieldAlert,
  Warehouse,
  X,
} from "lucide-react"

import clientsData from "@/data/mock/clients.json"
import skusData from "@/data/mock/skus.json"
import {
  clientTypeLabels,
  getClientTypeBadgeClass,
  getSkuSizeBadgeClass,
  getStockBadgeClass,
  skuCategoryLabels,
  skuSizeCategoryLabels,
  stockStatusLabels,
} from "@/lib/badge-styles"
import { getPickPackFee, getSizeMultiplierLabel } from "@/lib/billing-engine"
import { cn, formatDate, formatNumber } from "@/lib/utils"
import type { Client, SKU, SkuCategory, StockStatus } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const skus: SKU[] = skusData as SKU[]
const clients: Client[] = clientsData as Client[]

type CategoryFilter = "all" | SkuCategory
type StatusFilter = "all" | StockStatus
type ClientFilter = "all" | string

function getRowClassName(status: StockStatus): string {
  if (status === "kritis") {
    return "bg-red-50/40 hover:bg-red-50/60"
  }

  if (status === "menipis") {
    return "bg-amber-50/40 hover:bg-amber-50/60"
  }

  return "bg-white hover:bg-blue-50/30"
}

function getProgressClassName(status: StockStatus): string {
  if (status === "kritis") {
    return "bg-gradient-to-r from-red-500 to-red-400"
  }

  if (status === "menipis") {
    return "bg-gradient-to-r from-amber-500 to-amber-400"
  }

  return "bg-gradient-to-r from-emerald-500 to-emerald-400"
}

function getStatusWeight(status: StockStatus): number {
  if (status === "kritis") return 0
  if (status === "menipis") return 1
  return 2
}

export default function InventoryPage() {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [clientFilter, setClientFilter] = useState<ClientFilter>("all")
  const [showRestockAlert, setShowRestockAlert] = useState(true)

  const clientMap = useMemo(
    () => new Map(clients.map((client) => [client.id, client])),
    []
  )

  const uniqueClients = useMemo(
    () =>
      Array.from(
        new Map(clients.map((client) => [client.id, client])).values()
      ).sort((left, right) => left.name.localeCompare(right.name)),
    []
  )

  const filteredSkus = useMemo(() => {
    return [...skus]
      .filter((sku) => {
        const normalizedSearch = search.trim().toLowerCase()
        const matchesSearch =
          normalizedSearch.length === 0 ||
          sku.name.toLowerCase().includes(normalizedSearch) ||
          sku.skuCode.toLowerCase().includes(normalizedSearch)
        const matchesCategory =
          categoryFilter === "all" || sku.category === categoryFilter
        const matchesStatus = statusFilter === "all" || sku.status === statusFilter
        const matchesClient = clientFilter === "all" || sku.clientId === clientFilter

        return matchesSearch && matchesCategory && matchesStatus && matchesClient
      })
      .sort((left, right) => {
        const statusDiff = getStatusWeight(left.status) - getStatusWeight(right.status)

        if (statusDiff !== 0) {
          return statusDiff
        }

        return left.name.localeCompare(right.name)
      })
  }, [categoryFilter, clientFilter, search, statusFilter])

  const totalStock = skus.reduce((sum, sku) => sum + sku.stockQty, 0)
  const restockCount = skus.filter((sku) => sku.status !== "aman").length
  const criticalClientCount = new Set(
    skus.filter((sku) => sku.status === "kritis").map((sku) => sku.clientId)
  ).size
  const criticalSkus = skus.filter((sku) => sku.status === "kritis")

  const statCards = [
    { label: "Total SKU", value: formatNumber(skus.length), icon: Boxes, iconClass: "from-slate-50 to-slate-100 text-slate-700", accent: "border-l-slate-400" },
    { label: "Total Stok", value: formatNumber(totalStock), icon: Warehouse, iconClass: "from-blue-50 to-blue-100 text-blue-700", accent: "border-l-blue-500" },
    { label: "SKU Perlu Restock", value: formatNumber(restockCount), icon: AlertTriangle, iconClass: "from-amber-50 to-amber-100 text-amber-700", accent: "border-l-amber-500" },
    { label: "Klien dengan Stok Kritis", value: formatNumber(criticalClientCount), icon: ShieldAlert, iconClass: "from-red-50 to-red-100 text-red-600", accent: "border-l-red-500" },
  ]

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between animate-fade-in-up">
        <div className="space-y-2">
          <p className="text-sm font-medium text-blue-600">
            <span className="section-dot" />
            Inventory Monitoring
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Inventori
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            Monitoring stok SKU seluruh klien
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700"
          >
            Aman: {formatNumber(skus.filter((sku) => sku.status === "aman").length)}
          </Badge>
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 px-3 py-1 text-amber-700"
          >
            Menipis: {formatNumber(skus.filter((sku) => sku.status === "menipis").length)}
          </Badge>
          <Badge
            variant="outline"
            className="border-red-200 bg-red-50 px-3 py-1 text-red-700"
          >
            Kritis: {formatNumber(skus.filter((sku) => sku.status === "kritis").length)}
          </Badge>
        </div>
      </div>

      <Card className="card-glass animate-fade-in-up stagger-1">
        <CardContent className="p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,0.8fr))]">
            <div className="space-y-2">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                <Search className="size-3.5" />
                Pencarian
              </span>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama SKU atau kode..."
                className="h-10 border-slate-200/60 bg-white/60 text-slate-900 placeholder:text-slate-400 backdrop-blur-sm"
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Kategori
              </span>
              <Select
                value={categoryFilter}
                onValueChange={(value) => setCategoryFilter(value as CategoryFilter)}
              >
                <SelectTrigger className="h-10 w-full border-slate-200/60 bg-white/60 text-slate-900 backdrop-blur-sm">
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="buku">Buku</SelectItem>
                  <SelectItem value="atk">ATK</SelectItem>
                  <SelectItem value="modul_digital">Modul Digital</SelectItem>
                  <SelectItem value="elektronik">Elektronik</SelectItem>
                  <SelectItem value="lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Status
              </span>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as StatusFilter)}
              >
                <SelectTrigger className="h-10 w-full border-slate-200/60 bg-white/60 text-slate-900 backdrop-blur-sm">
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="aman">Aman</SelectItem>
                  <SelectItem value="menipis">Menipis</SelectItem>
                  <SelectItem value="kritis">Kritis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Klien
              </span>
              <Select
                value={clientFilter}
                onValueChange={(value) => setClientFilter(value as ClientFilter)}
              >
                <SelectTrigger className="h-10 w-full border-slate-200/60 bg-white/60 text-slate-900 backdrop-blur-sm">
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {uniqueClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-4">
        {statCards.map((item, index) => {
          const Icon = item.icon
          return (
            <Card key={item.label} className={`card-glass card-hover animate-fade-in-up border-l-4 ${item.accent} stagger-${index + 1}`}>
              <CardContent className="flex items-start gap-4 p-5">
                <div className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.iconClass}`}>
                  <Icon className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                  <p className="text-2xl font-semibold tracking-tight text-slate-900">
                    {item.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="card-glass animate-fade-in-up stagger-2">
        <CardHeader className="border-b border-slate-100/80">
          <CardTitle>
            <span className="section-dot" />
            Daftar SKU
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="min-w-[1120px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-5 py-3 text-slate-500">SKU Code</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">Nama Produk</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">Klien</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">Stok</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">Size</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">Tarif P&P</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">Min. Stok</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">Status</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">Last Updated</TableHead>
                <TableHead className="px-5 py-3 text-right text-slate-500">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSkus.map((sku) => {
                const client = clientMap.get(sku.clientId)
                const maxStock = sku.stockQty + sku.stockQty * 0.5
                const progressWidth = maxStock > 0 ? (sku.stockQty / maxStock) * 100 : 0

                return (
                  <TableRow
                    key={sku.id}
                    className={cn("border-slate-100/80 transition-colors duration-150", getRowClassName(sku.status))}
                  >
                    <TableCell className="px-5 py-4 font-mono text-sm text-slate-500">
                      {sku.skuCode}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900">{sku.name}</p>
                        <p className="text-sm text-slate-500">
                          {skuCategoryLabels[sku.category]}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="space-y-2">
                        <p className="font-medium text-slate-900">
                          {client?.name ?? "Klien tidak ditemukan"}
                        </p>
                        {client ? (
                          <Badge
                            variant="outline"
                            className={getClientTypeBadgeClass(client.type)}
                          >
                            {clientTypeLabels[client.type]}
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="min-w-[180px] space-y-2">
                        <p className="font-medium text-slate-900">
                          {formatNumber(sku.stockQty)} {sku.unit}
                        </p>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200/80">
                          <div
                            className={cn("h-full rounded-full animate-progress-fill", getProgressClassName(sku.status))}
                            style={{ width: `${Math.min(progressWidth, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge variant="outline" className={getSkuSizeBadgeClass(sku.sizeCategory)}>
                        {skuSizeCategoryLabels[sku.sizeCategory]}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="space-y-0.5">
                        <p className="font-medium text-slate-900">
                          Rp {formatNumber(getPickPackFee(sku.sizeCategory))}
                        </p>
                        <p className="text-xs text-slate-500">
                          {getSizeMultiplierLabel(sku.sizeCategory)} base
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-slate-600">
                      {formatNumber(sku.minStock)}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge
                        variant="outline"
                        className={getStockBadgeClass(sku.status)}
                      >
                        {stockStatusLabels[sku.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-slate-600">
                      {formatDate(sku.lastUpdated)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right">
                      <Link
                        href={`/clients/${sku.clientId}`}
                        className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700"
                      >
                        Detail Klien
                        <ArrowRight className="size-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredSkus.length === 0 ? (
            <div className="border-t border-slate-100/80 px-5 py-10 text-center">
              <p className="text-sm font-medium text-slate-900">Tidak ada SKU yang cocok</p>
              <p className="mt-1 text-sm text-slate-500">
                Coba ubah pencarian atau kombinasi filter yang sedang aktif.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {criticalSkus.length > 0 && showRestockAlert ? (
        <Card className="animate-fade-in-up border-l-4 border-l-orange-500 border-orange-200/60 bg-gradient-to-r from-orange-50/60 via-white to-white shadow-sm ring-0">
          <CardHeader className="border-b border-orange-100/80">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="size-4" />
                  SKU Membutuhkan Restock Segera
                </CardTitle>
                <p className="text-sm text-orange-600">
                  Prioritaskan SKU kritis untuk menjaga kelancaran operasional.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRestockAlert(false)}
                className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-orange-200 p-2 text-orange-500 transition-colors duration-200 hover:bg-orange-50 hover:text-orange-700"
                aria-label="Tutup notifikasi restock"
              >
                <X className="size-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-3">
              {criticalSkus.map((sku) => {
                const client = clientMap.get(sku.clientId)

                return (
                  <div
                    key={sku.id}
                    className="flex items-center gap-3 rounded-xl border border-orange-100/80 bg-gradient-to-r from-orange-50/60 to-white px-4 py-3 transition-all duration-200 hover:shadow-sm"
                  >
                    <span className="size-2 shrink-0 rounded-full bg-orange-500 animate-pulse-dot" />
                    <div>
                      <p className="font-medium text-slate-900">{sku.name}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {client?.name ?? "Klien tidak ditemukan"} · {formatNumber(sku.stockQty)}{" "}
                        {sku.unit}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </section>
  )
}

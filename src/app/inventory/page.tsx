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
import { cn, formatNumber } from "@/lib/utils"
import type { Client, ClientType, SKU, SkuCategory, StockStatus } from "@/types"
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

const categoryLabels: Record<SkuCategory, string> = {
  buku: "Buku",
  atk: "ATK",
  modul_digital: "Modul Digital",
  elektronik: "Elektronik",
  lainnya: "Lainnya",
}

const statusLabels: Record<StockStatus, string> = {
  aman: "Aman",
  menipis: "Menipis",
  kritis: "Kritis",
}

const clientTypeLabels: Record<ClientType, string> = {
  space: "Space",
  fulfillment: "Fulfillment",
  hybrid: "Hybrid",
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
}

function getStatusBadgeClass(status: StockStatus): string {
  if (status === "kritis") {
    return "border-red-200 bg-red-50 text-red-700 hover:bg-red-50"
  }

  if (status === "menipis") {
    return "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50"
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
}

function getClientTypeBadgeClass(type: ClientType): string {
  if (type === "space") {
    return "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50"
  }

  if (type === "fulfillment") {
    return "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-50"
  }

  return "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-50"
}

function getRowClassName(status: StockStatus): string {
  if (status === "kritis") {
    return "bg-red-50/60 hover:bg-red-50"
  }

  if (status === "menipis") {
    return "bg-amber-50/60 hover:bg-amber-50"
  }

  return "bg-white hover:bg-slate-50"
}

function getProgressClassName(status: StockStatus): string {
  if (status === "kritis") {
    return "bg-red-500"
  }

  if (status === "menipis") {
    return "bg-amber-500"
  }

  return "bg-emerald-500"
}

function getStatusWeight(status: StockStatus): number {
  if (status === "kritis") {
    return 0
  }

  if (status === "menipis") {
    return 1
  }

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

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-indigo-600">Inventory Monitoring</p>
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

      <Card className="border border-slate-200 bg-white shadow-none ring-0">
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
                className="h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
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
                <SelectTrigger className="h-10 w-full border-slate-200 bg-white text-slate-900">
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
                <SelectTrigger className="h-10 w-full border-slate-200 bg-white text-slate-900">
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
                <SelectTrigger className="h-10 w-full border-slate-200 bg-white text-slate-900">
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

      <div className="grid gap-6 xl:grid-cols-4">
        <Card className="border border-slate-200 bg-white shadow-none ring-0">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Boxes className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Total SKU</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">
                {formatNumber(skus.length)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-none ring-0">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Warehouse className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Total Stok</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">
                {formatNumber(totalStock)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-none ring-0">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <AlertTriangle className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">SKU Perlu Restock</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">
                {formatNumber(restockCount)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-none ring-0">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-50 text-red-700">
              <ShieldAlert className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Klien dengan Stok Kritis</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">
                {formatNumber(criticalClientCount)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 bg-white shadow-none ring-0">
        <CardHeader className="border-b border-slate-100">
          <CardTitle>Daftar SKU</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="min-w-[1120px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-5 py-3 text-slate-500">SKU Code</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">Nama Produk</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">Klien</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">Stok</TableHead>
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
                    className={cn("border-slate-100", getRowClassName(sku.status))}
                  >
                    <TableCell className="px-5 py-4 font-mono text-sm text-slate-500">
                      {sku.skuCode}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900">{sku.name}</p>
                        <p className="text-sm text-slate-500">
                          {categoryLabels[sku.category]}
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
                        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={cn("h-full rounded-full", getProgressClassName(sku.status))}
                            style={{ width: `${Math.min(progressWidth, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-slate-600">
                      {formatNumber(sku.minStock)}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge
                        variant="outline"
                        className={getStatusBadgeClass(sku.status)}
                      >
                        {statusLabels[sku.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-slate-600">
                      {formatDate(sku.lastUpdated)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right">
                      <Link
                        href={`/clients/${sku.clientId}`}
                        className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-indigo-600 transition-colors duration-200 hover:text-indigo-700"
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
            <div className="border-t border-slate-100 px-5 py-10 text-center">
              <p className="text-sm font-medium text-slate-900">Tidak ada SKU yang cocok</p>
              <p className="mt-1 text-sm text-slate-500">
                Coba ubah pencarian atau kombinasi filter yang sedang aktif.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {criticalSkus.length > 0 && showRestockAlert ? (
        <Card className="border border-red-200 bg-white shadow-none ring-0">
          <CardHeader className="border-b border-red-100">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-red-700">
                  ⚠ SKU Membutuhkan Restock Segera
                </CardTitle>
                <p className="text-sm text-red-600">
                  Prioritaskan SKU kritis untuk menjaga kelancaran operasional.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRestockAlert(false)}
                className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-red-200 p-2 text-red-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-700"
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
                    className="rounded-xl border border-red-100 bg-red-50/60 px-4 py-3"
                  >
                    <p className="font-medium text-slate-900">{sku.name}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {client?.name ?? "Klien tidak ditemukan"} · {formatNumber(sku.stockQty)}{" "}
                      {sku.unit}
                    </p>
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

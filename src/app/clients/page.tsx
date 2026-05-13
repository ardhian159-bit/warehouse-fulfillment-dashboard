"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, Building2, FileText, Filter, Search } from "lucide-react"

import billingData from "@/data/mock/billing.json"
import clientsData from "@/data/mock/clients.json"
import {
  clientStatusLabels,
  clientTypeLabels,
  contractTypeLabels,
  getClientStatusBadgeClass,
  getClientTypeBadgeClass,
  getContractBadgeClass,
} from "@/lib/badge-styles"
import { formatNumber, formatRupiah } from "@/lib/utils"
import type { BillingItem, Client, ClientStatus, ClientType, ContractType } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const clients: Client[] = clientsData as Client[]
const billingItems: BillingItem[] = billingData as BillingItem[]

type ClientTypeFilter = "all" | ClientType
type ContractFilter = "all" | ContractType
type StatusFilter = "all" | ClientStatus

function getMonthlyCharge(client: Client, monthlyStorageMap: Map<string, number>): number {
  const estimate = client.areaM2 * client.rackLevels * client.ratePerM2
  return monthlyStorageMap.get(client.id) ?? estimate
}

function getTypeAccentBorder(type: ClientType): string {
  if (type === "space") return "border-l-sky-400"
  if (type === "fulfillment") return "border-l-blue-500"
  return "border-l-violet-500"
}

export default function ClientsPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<ClientTypeFilter>("all")
  const [contractFilter, setContractFilter] = useState<ContractFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  const activeClients = clients.filter((client) => client.status === "active")
  const monthlyStorageMap = new Map(
    billingItems
      .filter((item) => item.billingMonth === "2025-05")
      .map((item) => [item.clientId, item.storageFee])
  )

  const filteredClients = clients
    .filter((client) => {
      const matchesSearch = client.name.toLowerCase().includes(search.toLowerCase())
      const matchesType = typeFilter === "all" || client.type === typeFilter
      const matchesContract =
        contractFilter === "all" || client.contractType === contractFilter
      const matchesStatus = statusFilter === "all" || client.status === statusFilter

      return matchesSearch && matchesType && matchesContract && matchesStatus
    })
    .sort((left, right) => {
      if (left.status !== right.status) {
        return left.status === "active" ? -1 : 1
      }

      return right.joinDate.localeCompare(left.joinDate)
    })

  const totalArea = activeClients.reduce((sum, client) => sum + client.areaM2, 0)
  const estimatedRevenue = activeClients.reduce(
    (sum, client) => sum + client.areaM2 * client.rackLevels * client.ratePerM2,
    0
  )
  const averageRate =
    activeClients.reduce((sum, client) => sum + client.ratePerM2, 0) /
    activeClients.length

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between animate-fade-in-up">
        <div className="space-y-2">
          <p className="text-sm font-medium text-blue-600">
            <span className="section-dot" />
            Client Management
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Manajemen Klien
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            Kelola klien sewa space dan jasa fulfillment
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-slate-200/60 bg-white/80 px-3 py-1 text-slate-700 backdrop-blur-sm">
            Aktif: {formatNumber(activeClients.length)}
          </Badge>
          <Badge variant="outline" className="border-sky-200 bg-sky-50 px-3 py-1 text-sky-700">
            Space: {formatNumber(clients.filter((client) => client.type === "space").length)}
          </Badge>
          <Badge
            variant="outline"
            className="border-blue-200 bg-blue-50 px-3 py-1 text-blue-700"
          >
            Fulfillment:{" "}
            {formatNumber(clients.filter((client) => client.type === "fulfillment").length)}
          </Badge>
          <Badge
            variant="outline"
            className="border-violet-200 bg-violet-50 px-3 py-1 text-violet-700"
          >
            Hybrid: {formatNumber(clients.filter((client) => client.type === "hybrid").length)}
          </Badge>
        </div>
      </div>

      <Card className="card-glass animate-fade-in-up stagger-1">
        <CardContent className="p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,0.8fr))]">
            <label className="space-y-2">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                <Search className="size-3.5" />
                Pencarian
              </span>
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama klien..."
                className="h-10 border-slate-200/60 bg-white/60 text-slate-900 placeholder:text-slate-400 backdrop-blur-sm"
              />
            </label>

            <label className="space-y-2">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                <Filter className="size-3.5" />
                Tipe
              </span>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as ClientTypeFilter)}
                className="h-10 w-full cursor-pointer rounded-lg border border-slate-200/60 bg-white/60 px-3 text-sm text-slate-900 outline-none backdrop-blur-sm transition-colors focus:border-blue-300 focus:ring-3 focus:ring-blue-100"
              >
                <option value="all">Semua</option>
                <option value="space">Space</option>
                <option value="fulfillment">Fulfillment</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Kontrak
              </span>
              <select
                value={contractFilter}
                onChange={(event) => setContractFilter(event.target.value as ContractFilter)}
                className="h-10 w-full cursor-pointer rounded-lg border border-slate-200/60 bg-white/60 px-3 text-sm text-slate-900 outline-none backdrop-blur-sm transition-colors focus:border-blue-300 focus:ring-3 focus:ring-blue-100"
              >
                <option value="all">Semua</option>
                <option value="reguler">Reguler</option>
                <option value="group">Group</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Status
              </span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                className="h-10 w-full cursor-pointer rounded-lg border border-slate-200/60 bg-white/60 px-3 text-sm text-slate-900 outline-none backdrop-blur-sm transition-colors focus:border-blue-300 focus:ring-3 focus:ring-blue-100"
              >
                <option value="all">Semua</option>
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="card-glass animate-fade-in-up stagger-2">
        <CardHeader className="border-b border-slate-100/80">
          <CardTitle>
            <span className="section-dot" />
            Daftar Klien
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="min-w-[980px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-5 py-3 text-slate-500">Nama Klien</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">Tipe</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">Kontrak</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">Area</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">Rate</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">Tagihan/Bulan</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">Status</TableHead>
                <TableHead className="px-5 py-3 text-right text-slate-500">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow
                  key={client.id}
                  className={`border-l-4 border-slate-100/80 transition-colors duration-150 hover:bg-blue-50/30 ${getTypeAccentBorder(client.type)}`}
                >
                  <TableCell className="px-5 py-4">
                    <div className="space-y-1">
                      <p className="font-medium text-slate-900">{client.name}</p>
                      <p className="text-sm text-slate-500">{client.contactPerson}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge
                      variant="outline"
                      className={getClientTypeBadgeClass(client.type)}
                    >
                      {clientTypeLabels[client.type]}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge
                      variant="outline"
                      className={getContractBadgeClass(client.contractType)}
                    >
                      {contractTypeLabels[client.contractType]}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-slate-600">
                    {formatNumber(client.areaM2)} m² · {formatNumber(client.rackLevels)} lantai
                  </TableCell>
                  <TableCell className="px-5 py-4 text-slate-600">
                    {formatRupiah(client.ratePerM2)}/m²
                  </TableCell>
                  <TableCell className="px-5 py-4 font-medium text-slate-900">
                    {formatRupiah(getMonthlyCharge(client, monthlyStorageMap))}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge
                      variant="outline"
                      className={getClientStatusBadgeClass(client.status)}
                    >
                      {clientStatusLabels[client.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-right">
                    <Link
                      href={`/clients/${client.id}`}
                      className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700"
                    >
                      Detail
                      <ArrowRight className="size-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredClients.length === 0 ? (
            <div className="border-t border-slate-100/80 px-5 py-10 text-center">
              <p className="text-sm font-medium text-slate-900">Tidak ada klien yang cocok</p>
              <p className="mt-1 text-sm text-slate-500">
                Coba ubah kata kunci pencarian atau filter yang sedang aktif.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="card-glass card-hover animate-fade-in-up stagger-3">
          <CardContent className="flex h-full items-start gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700">
              <Building2 className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Total Area Tersewa</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">
                {formatNumber(totalArea)} m²
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass card-hover animate-fade-in-up stagger-3">
          <CardContent className="flex h-full items-start gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700">
              <FileText className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Est. Revenue Space/Bulan</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">
                {formatRupiah(estimatedRevenue)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass card-hover animate-fade-in-up stagger-4">
          <CardContent className="flex h-full items-start gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700">
              <Filter className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Rata-rata Rate</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">
                {formatRupiah(Math.round(averageRate))}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

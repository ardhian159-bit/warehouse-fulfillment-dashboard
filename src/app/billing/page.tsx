"use client"

import { useMemo, useState } from "react"
import { ArrowRight, CheckCircle2, Clock3, FileSpreadsheet, Receipt, Wallet } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import billingData from "@/data/mock/billing.json"
import clientsData from "@/data/mock/clients.json"
import palletsData from "@/data/mock/pallets.json"
import skusData from "@/data/mock/skus.json"
import transactionsData from "@/data/mock/transactions.json"
import {
  billingStatusLabels,
  clientTypeLabels,
  getBillingStatusBadgeClass,
  getClientTypeBadgeClass,
} from "@/lib/badge-styles"
import { calculateClientBilling } from "@/lib/billing-engine"
import { formatRupiah } from "@/lib/utils"
import type { BillingItem, Client, Pallet, SKU, Transaction } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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

const clients: Client[] = clientsData as Client[]
const staticBillingItems: BillingItem[] = billingData as BillingItem[]
const transactions: Transaction[] = transactionsData as Transaction[]
const pallets: Pallet[] = palletsData as Pallet[]
const skusList: SKU[] = skusData as SKU[]

const monthOptions = [
  { label: "Mei 2025", value: "2025-05" },
  { label: "April 2025", value: "2025-04" },
] as const

function getFulfillmentFee(item: BillingItem): number {
  return (
    item.inboundFee +
    item.outboundFee +
    item.pickingPackingFee +
    item.returnFee +
    item.expiredFee +
    item.withdrawalFee +
    item.deadStockFee
  )
}

export default function BillingPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>("2025-05")
  const [useAutoCalc, setUseAutoCalc] = useState(false)

  const clientMap = useMemo(
    () => new Map(clients.map((client) => [client.id, client])),
    []
  )

  // Compute billing from engine when auto-calc is enabled
  const computedBilling = useMemo(() => {
    return clients
      .filter((c) => c.status === "active")
      .map((client) =>
        calculateClientBilling(client, transactions, pallets, skusList, selectedMonth)
      )
      .filter((b) => b.totalFee > 0)
  }, [selectedMonth])

  const monthlyBilling = useMemo(
    () => {
      const source = useAutoCalc ? computedBilling : staticBillingItems
      return source
        .filter((item) => item.billingMonth === selectedMonth)
        .sort((left, right) => right.totalFee - left.totalFee)
    },
    [selectedMonth, useAutoCalc, computedBilling]
  )

  const totalRevenue = monthlyBilling.reduce((sum, item) => sum + item.totalFee, 0)
  const paidCount = monthlyBilling.filter((item) => item.status === "paid").length
  const sentCount = monthlyBilling.filter((item) => item.status === "sent").length
  const draftCount = monthlyBilling.filter((item) => item.status === "draft").length
  const averagePerClient =
    monthlyBilling.length > 0 ? totalRevenue / monthlyBilling.length : 0
  const unpaidCount = monthlyBilling.filter((item) => item.status !== "paid").length

  const storageFeeTotal = monthlyBilling.reduce((sum, item) => sum + item.storageFee, 0)
  const fulfillmentFeeTotal = monthlyBilling.reduce(
    (sum, item) => sum + getFulfillmentFee(item),
    0
  )

  const chartData = [
    {
      name: "Storage Fee",
      value: storageFeeTotal,
      fill: "#2563eb",
    },
    {
      name: "Fulfillment Fee",
      value: fulfillmentFeeTotal,
      fill: "#f97316",
    },
  ]

  const selectedMonthLabel =
    monthOptions.find((option) => option.value === selectedMonth)?.label ?? selectedMonth

  const statCards = [
    { label: "Total Tagihan", value: formatRupiah(totalRevenue), icon: Wallet, iconClass: "from-blue-50 to-blue-100 text-blue-700", accent: "border-l-blue-500" },
    { label: "Sudah Lunas", value: String(paidCount), icon: CheckCircle2, iconClass: "from-emerald-50 to-emerald-100 text-emerald-700", accent: "border-l-emerald-500", badge: { label: "Lunas", class: "border-emerald-200 bg-emerald-50 text-emerald-700" } },
    { label: "Menunggu Pembayaran", value: String(sentCount), icon: Clock3, iconClass: "from-amber-50 to-amber-100 text-amber-700", accent: "border-l-amber-500", badge: { label: "Terkirim", class: "border-amber-200 bg-amber-50 text-amber-700" } },
    { label: "Draft", value: String(draftCount), icon: Receipt, iconClass: "from-slate-50 to-slate-100 text-slate-700", accent: "border-l-slate-400", badge: { label: "Draft", class: "border-slate-200 bg-slate-100 text-slate-700" } },
  ]

  const feeLabels = [
    { key: "storageFee" as const, label: "Storage Fee" },
    { key: "inboundFee" as const, label: "Inbound Fee" },
    { key: "outboundFee" as const, label: "Outbound Fee" },
    { key: "pickingPackingFee" as const, label: "Picking & Packing Fee" },
    { key: "returnFee" as const, label: "Return Fee" },
    { key: "expiredFee" as const, label: "Expired Fee" },
    { key: "withdrawalFee" as const, label: "Withdrawal Fee" },
    { key: "deadStockFee" as const, label: "Dead Stock Fee" },
  ]

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between animate-fade-in-up">
        <div className="space-y-2">
          <p className="text-sm font-medium text-blue-600">
            <span className="section-dot" />
            Billing Overview
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Billing
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            Rekap tagihan bulanan per klien
          </p>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Bulan
          </span>
          <Select value={selectedMonth} onValueChange={(value) => { if (value) setSelectedMonth(value) }}>
            <SelectTrigger className="h-10 w-[180px] border-slate-200/60 bg-white/60 text-slate-900 backdrop-blur-sm">
              <SelectValue placeholder="Pilih bulan" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={() => setUseAutoCalc(!useAutoCalc)}
            className={`mt-2 cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
              useAutoCalc
                ? "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
                : "border-slate-200/60 bg-white/60 text-slate-500 hover:text-slate-700"
            }`}
          >
            {useAutoCalc ? "✓ Auto-Kalkulasi" : "Mode Statis"}
          </button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        {statCards.map((item, index) => {
          const Icon = item.icon
          return (
            <Card key={item.label} className={`card-glass card-hover animate-fade-in-up border-l-4 ${item.accent} stagger-${index + 1}`}>
              <CardContent className="flex items-start gap-4 p-5">
                <div className={`flex size-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.iconClass}`}>
                  <Icon className="size-5" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500">{item.label}</p>
                  <p className="text-2xl font-semibold tracking-tight text-slate-900">
                    {item.value}
                  </p>
                  {item.badge ? (
                    <Badge variant="outline" className={item.badge.class}>
                      {item.badge.label}
                    </Badge>
                  ) : null}
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
            Daftar Tagihan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="min-w-[980px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-5 py-3 text-slate-500">Klien</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">Storage Fee</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">Fulfillment Fee</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">Total</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">Status</TableHead>
                <TableHead className="px-5 py-3 text-right text-slate-500">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyBilling.map((item) => {
                const client = clientMap.get(item.clientId)
                const fulfillmentFee = getFulfillmentFee(item)

                return (
                  <TableRow key={item.id} className="border-slate-100/80 transition-colors duration-150 hover:bg-blue-50/30">
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
                    <TableCell className="px-5 py-4 text-slate-600">
                      {formatRupiah(item.storageFee)}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-slate-600">
                      {formatRupiah(fulfillmentFee)}
                    </TableCell>
                    <TableCell className="px-5 py-4 font-semibold text-blue-700">
                      {formatRupiah(item.totalFee)}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <Badge
                        variant="outline"
                        className={getBillingStatusBadgeClass(item.status)}
                      >
                        {billingStatusLabels[item.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right">
                      <Dialog>
                        <DialogTrigger
                          render={
                            <button className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-blue-600 transition-colors duration-200 hover:text-blue-700" />
                          }
                        >
                          Lihat Detail
                          <ArrowRight className="size-4" />
                        </DialogTrigger>
                        <DialogContent className="max-w-xl gap-0 p-0 sm:max-w-xl">
                          <DialogHeader className="border-b border-slate-100/80 px-6 py-5">
                            <div className="flex items-start justify-between gap-4 pr-10">
                              <div className="space-y-2">
                                <DialogTitle>
                                  {(client?.name ?? "Klien tidak ditemukan") + " · " + selectedMonthLabel}
                                </DialogTitle>
                                <DialogDescription>
                                  Rincian komponen tagihan untuk periode {selectedMonthLabel.toLowerCase()}.
                                </DialogDescription>
                              </div>
                              <Badge
                                variant="outline"
                                className={getBillingStatusBadgeClass(item.status)}
                              >
                                {billingStatusLabels[item.status]}
                              </Badge>
                            </div>
                          </DialogHeader>

                          <div className="space-y-1 px-6 py-5 text-sm text-slate-600">
                            {feeLabels.map((fee, feeIndex) => (
                              <div
                                key={fee.key}
                                className={`flex items-center justify-between gap-4 rounded-lg px-3 py-2 transition-colors duration-150 hover:bg-slate-50 ${feeIndex % 2 === 0 ? "bg-slate-50/50" : ""}`}
                              >
                                <span>{fee.label}</span>
                                <span>{formatRupiah(item[fee.key])}</span>
                              </div>
                            ))}

                            <div className="border-t border-slate-200/60 pt-4 mt-3">
                              <div className="flex items-center justify-between gap-4 px-3">
                                <span className="text-sm font-medium text-slate-500">TOTAL</span>
                                <span className="bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-2xl font-semibold tracking-tight text-transparent">
                                  {formatRupiah(item.totalFee)}
                                </span>
                              </div>
                            </div>

                            <div className="mt-4 rounded-xl border border-slate-200/60 bg-gradient-to-br from-slate-50/80 to-white px-4 py-3">
                              <p className="text-sm font-medium text-slate-700">Catatan</p>
                              <p className="mt-1 text-sm text-slate-500">
                                Tidak ada catatan tambahan untuk tagihan ini.
                              </p>
                            </div>
                          </div>

                          <DialogFooter className="mt-0" showCloseButton={false}>
                            <DialogClose
                              render={<Button variant="outline" className="cursor-pointer" />}
                            >
                              Tutup
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {monthlyBilling.length === 0 ? (
            <div className="border-t border-slate-100/80 px-5 py-10 text-center">
              <p className="text-sm font-medium text-slate-900">Belum ada data billing</p>
              <p className="mt-1 text-sm text-slate-500">
                Tidak ada tagihan yang tersedia untuk periode yang dipilih.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="card-glass animate-fade-in-up stagger-3">
        <CardHeader className="border-b border-slate-100/80">
          <CardTitle>
            <span className="section-dot" />
            Komposisi Revenue Bulan Ini
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={106}
                  paddingAngle={2}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatRupiah(Number(value))}
                  contentStyle={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                    backgroundColor: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(8px)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {chartData.map((entry) => (
              <div
                key={entry.name}
                className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-gradient-to-r from-slate-50/80 to-white px-4 py-3 transition-all duration-200 hover:shadow-sm"
              >
                <span
                  className="size-3 rounded-full shadow-sm"
                  style={{ backgroundColor: entry.fill }}
                />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-900">{entry.name}</p>
                  <p className="text-sm text-slate-500">{formatRupiah(entry.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="card-glass card-hover animate-fade-in-up stagger-3">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700">
              <Wallet className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Total Revenue</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">
                {formatRupiah(totalRevenue)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass card-hover animate-fade-in-up stagger-3">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700">
              <FileSpreadsheet className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Avg per Klien</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">
                {formatRupiah(averagePerClient)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass card-hover animate-fade-in-up stagger-4">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700">
              <Clock3 className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Klien Belum Bayar</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">
                {unpaidCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

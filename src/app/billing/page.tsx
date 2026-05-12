"use client"

import { useMemo, useState } from "react"
import { ArrowRight, CheckCircle2, Clock3, FileSpreadsheet, Receipt, Wallet } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import billingData from "@/data/mock/billing.json"
import clientsData from "@/data/mock/clients.json"
import { formatRupiah } from "@/lib/utils"
import type { BillingItem, Client, ClientType } from "@/types"
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
const billingItems: BillingItem[] = billingData as BillingItem[]

const monthOptions = [
  { label: "Mei 2025", value: "2025-05" },
  { label: "April 2025", value: "2025-04" },
] as const

const clientTypeLabels: Record<ClientType, string> = {
  space: "Space",
  fulfillment: "Fulfillment",
  hybrid: "Hybrid",
}

const billingStatusLabels: Record<BillingItem["status"], string> = {
  paid: "Lunas",
  sent: "Terkirim",
  draft: "Draft",
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

function getBillingStatusBadgeClass(status: BillingItem["status"]): string {
  if (status === "paid") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
  }

  if (status === "sent") {
    return "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50"
  }

  return "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100"
}

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

  const clientMap = useMemo(
    () => new Map(clients.map((client) => [client.id, client])),
    []
  )

  const monthlyBilling = useMemo(
    () =>
      billingItems
        .filter((item) => item.billingMonth === selectedMonth)
        .sort((left, right) => right.totalFee - left.totalFee),
    [selectedMonth]
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
      fill: "#4f46e5",
    },
    {
      name: "Fulfillment Fee",
      value: fulfillmentFeeTotal,
      fill: "#0f766e",
    },
  ]

  const selectedMonthLabel =
    monthOptions.find((option) => option.value === selectedMonth)?.label ?? selectedMonth

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-indigo-600">Billing Overview</p>
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
            <SelectTrigger className="h-10 w-[180px] border-slate-200 bg-white text-slate-900">
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
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        <Card className="border border-slate-200 bg-white shadow-none ring-0">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Wallet className="size-5" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">Total Tagihan</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">
                {formatRupiah(totalRevenue)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-none ring-0">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="size-5" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500">Sudah Lunas</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">
                {paidCount}
              </p>
              <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-50 text-emerald-700"
              >
                Lunas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-none ring-0">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
              <Clock3 className="size-5" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500">Menunggu Pembayaran</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">
                {sentCount}
              </p>
              <Badge
                variant="outline"
                className="border-amber-200 bg-amber-50 text-amber-700"
              >
                Terkirim
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-none ring-0">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Receipt className="size-5" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-500">Draft</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">
                {draftCount}
              </p>
              <Badge
                variant="outline"
                className="border-slate-200 bg-slate-100 text-slate-700"
              >
                Draft
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 bg-white shadow-none ring-0">
        <CardHeader className="border-b border-slate-100">
          <CardTitle>Daftar Tagihan</CardTitle>
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
                  <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50">
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
                    <TableCell className="px-5 py-4 font-semibold text-indigo-700">
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
                            <button className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-indigo-600 transition-colors duration-200 hover:text-indigo-700" />
                          }
                        >
                          Lihat Detail
                          <ArrowRight className="size-4" />
                        </DialogTrigger>
                        <DialogContent className="max-w-xl gap-0 p-0 sm:max-w-xl">
                          <DialogHeader className="border-b border-slate-100 px-6 py-5">
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

                          <div className="space-y-3 px-6 py-5 text-sm text-slate-600">
                            <div className="flex items-center justify-between gap-4">
                              <span>Storage Fee</span>
                              <span>{formatRupiah(item.storageFee)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span>Inbound Fee</span>
                              <span>{formatRupiah(item.inboundFee)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span>Outbound Fee</span>
                              <span>{formatRupiah(item.outboundFee)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span>Picking & Packing Fee</span>
                              <span>{formatRupiah(item.pickingPackingFee)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span>Return Fee</span>
                              <span>{formatRupiah(item.returnFee)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span>Expired Fee</span>
                              <span>{formatRupiah(item.expiredFee)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span>Withdrawal Fee</span>
                              <span>{formatRupiah(item.withdrawalFee)}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                              <span>Dead Stock Fee</span>
                              <span>{formatRupiah(item.deadStockFee)}</span>
                            </div>

                            <div className="border-t border-slate-200 pt-4">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-sm font-medium text-slate-500">TOTAL</span>
                                <span className="text-2xl font-semibold tracking-tight text-indigo-700">
                                  {formatRupiah(item.totalFee)}
                                </span>
                              </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
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
            <div className="border-t border-slate-100 px-5 py-10 text-center">
              <p className="text-sm font-medium text-slate-900">Belum ada data billing</p>
              <p className="mt-1 text-sm text-slate-500">
                Tidak ada tagihan yang tersedia untuk periode yang dipilih.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white shadow-none ring-0">
        <CardHeader className="border-b border-slate-100">
          <CardTitle>Komposisi Revenue Bulan Ini</CardTitle>
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
                    boxShadow: "none",
                    backgroundColor: "#ffffff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {chartData.map((entry) => (
              <div
                key={entry.name}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <span
                  className="size-3 rounded-full"
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

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border border-slate-200 bg-white shadow-none ring-0">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
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

        <Card className="border border-slate-200 bg-white shadow-none ring-0">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
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

        <Card className="border border-slate-200 bg-white shadow-none ring-0">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
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

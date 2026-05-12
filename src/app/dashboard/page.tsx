"use client"

import {
  ArrowRight,
  BadgeAlert,
  Boxes,
  Building2,
  ClipboardList,
  Wallet,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import billingData from "@/data/mock/billing.json"
import clientsData from "@/data/mock/clients.json"
import skusData from "@/data/mock/skus.json"
import transactionsData from "@/data/mock/transactions.json"
import { formatNumber, formatRupiah } from "@/lib/utils"
import type { BillingItem, Client, OrderStatus, SKU, Transaction } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const clients: Client[] = clientsData as Client[]
const skus: SKU[] = skusData as SKU[]
const transactions: Transaction[] = transactionsData as Transaction[]
const billingItems: BillingItem[] = billingData as BillingItem[]

const operationalFlow = [
  { label: "Barang Masuk", value: 520 },
  { label: "Picking", value: 210 },
  { label: "Packing", value: 175 },
  { label: "Siap Kirim", value: 140 },
]

const revenueChartData = [
  { name: "Sewa Space", value: 39960000 },
  { name: "Jasa Fulfillment", value: 156492000 },
]

const transactionTypeLabels: Record<Transaction["type"], string> = {
  inbound: "Inbound",
  outbound: "Outbound",
  return: "Retur",
  withdrawal: "Withdrawal",
  expired: "Expired",
}

const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Menunggu",
  picking: "Picking",
  packing: "Packing",
  shipped: "Terkirim",
  cancelled: "Dibatalkan",
}

const stockStatusLabels: Record<SKU["status"], string> = {
  aman: "Aman",
  menipis: "Menipis",
  kritis: "Kritis",
}

function formatShortRupiah(amount: number): string {
  return `Rp ${new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(amount / 1_000_000)}jt`
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
}

function getStockBadgeClass(status: SKU["status"]): string {
  if (status === "kritis") {
    return "border-red-200 bg-red-50 text-red-700 hover:bg-red-50"
  }

  if (status === "menipis") {
    return "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50"
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
}

function getOrderStatusBadge(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100"
    case "picking":
      return "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50"
    case "packing":
      return "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-50"
    case "shipped":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
    case "cancelled":
      return "border-red-200 bg-red-50 text-red-700 hover:bg-red-50"
    default:
      return ""
  }
}

export default function DashboardPage() {
  const activeClients = clients.filter((client) => client.status === "active")
  const criticalSkus = skus.filter((sku) => sku.status === "kritis")
  const monthlyTransactions = transactions.filter((transaction) =>
    transaction.date.startsWith("2025-05")
  )
  const monthlyRevenue = billingItems
    .filter((item) => item.billingMonth === "2025-05")
    .reduce((total, item) => total + item.totalFee, 0)

  const stockAlerts = skus
    .filter((sku) => sku.status === "kritis" || sku.status === "menipis")
    .sort((left, right) => {
      const weight = { kritis: 0, menipis: 1, aman: 2 }
      return weight[left.status] - weight[right.status]
    })

  const recentTransactions = [...transactions]
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, 5)

  const clientMap = new Map(clients.map((client) => [client.id, client.name]))
  const skuMap = new Map(skus.map((sku) => [sku.id, sku.name]))

  const stats = [
    {
      label: "Total Klien Aktif",
      value: formatNumber(activeClients.length),
      description: "Klien aktif dengan kontrak berjalan",
      icon: Building2,
      iconClassName: "bg-blue-50 text-blue-700",
    },
    {
      label: "SKU Kritis",
      value: formatNumber(criticalSkus.length),
      description: "Produk yang butuh restock segera",
      icon: BadgeAlert,
      iconClassName: "bg-red-50 text-red-700",
    },
    {
      label: "Transaksi Bulan Ini",
      value: formatNumber(monthlyTransactions.length),
      description: "Aktivitas inbound, outbound, retur, dan withdrawal",
      icon: ClipboardList,
      iconClassName: "bg-amber-50 text-amber-700",
    },
    {
      label: "Total Revenue Bulan Ini",
      value: formatRupiah(monthlyRevenue),
      description: "Akumulasi billing bulan Mei 2025",
      icon: Wallet,
      iconClassName: "bg-indigo-50 text-indigo-700",
    },
  ]

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-indigo-600">Overview Operasional</p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Ringkasan hybrid warehouse fulfillment
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Pantau klien aktif, volume transaksi, alur operasional, dan sinyal stok
          dalam satu tampilan yang ringkas.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon

          return (
            <Card
              key={item.label}
              className="border border-slate-200 bg-white shadow-none ring-0"
            >
              <CardContent className="flex h-full flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">{item.label}</p>
                    <p className="text-2xl font-semibold tracking-tight text-slate-900">
                      {item.value}
                    </p>
                  </div>
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${item.iconClassName}`}
                  >
                    <Icon className="size-5" />
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-500">{item.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border border-slate-200 bg-white shadow-none ring-0">
        <CardHeader className="border-b border-slate-100">
          <CardTitle>Alur Operasional Hari Ini</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
            {operationalFlow.map((step, index) => (
              <div
                key={step.label}
                className="contents"
              >
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Tahap {index + 1}
                    </span>
                    <Boxes className="size-4 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">{step.label}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                    {formatNumber(step.value)}
                  </p>
                </div>
                {index < operationalFlow.length - 1 ? (
                  <div className="hidden items-center justify-center md:flex">
                    <ArrowRight className="size-4 text-slate-300" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="border border-slate-200 bg-white shadow-none ring-0 xl:col-span-3">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Perbandingan Revenue</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueChartData}
                  margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                  barCategoryGap={48}
                >
                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis
                    axisLine={false}
                    tickLine={false}
                    dataKey="name"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={88}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickFormatter={(value) => formatShortRupiah(value)}
                  />
                  <Tooltip
                    cursor={{ fill: "#eef2ff" }}
                    formatter={(value) => formatRupiah(Number(value))}
                    contentStyle={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "none",
                      backgroundColor: "#ffffff",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#4f46e5"
                    radius={[10, 10, 0, 0]}
                    maxBarSize={72}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-none ring-0 xl:col-span-2">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Peringatan Stok</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-5">
            {stockAlerts.map((sku) => (
              <div
                key={sku.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="min-w-0 space-y-1">
                  <p className="line-clamp-2 text-sm font-medium leading-5 text-slate-900">
                    {sku.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    Stok saat ini: {formatNumber(sku.stockQty)} {sku.unit}
                  </p>
                </div>
                  <Badge
                  variant="outline"
                  className={getStockBadgeClass(sku.status)}
                >
                  {stockStatusLabels[sku.status]}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200 bg-white shadow-none ring-0">
        <CardHeader className="border-b border-slate-100">
          <CardTitle>Transaksi Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-5 py-3 text-slate-500">Tanggal</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">Klien</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">SKU</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">Tipe</TableHead>
                <TableHead className="px-5 py-3 text-right text-slate-500">Qty</TableHead>
                <TableHead className="px-5 py-3 text-right text-slate-500">Fee</TableHead>
                <TableHead className="px-5 py-3 text-slate-500">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  className="border-slate-100 hover:bg-slate-50/80"
                >
                  <TableCell className="px-5 py-4 text-slate-600">
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell className="px-5 py-4 font-medium text-slate-900">
                    {clientMap.get(transaction.clientId) ?? "-"}
                  </TableCell>
                  <TableCell className="max-w-[260px] px-5 py-4 text-slate-600 whitespace-normal">
                    {skuMap.get(transaction.skuId) ?? "-"}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-slate-600">
                    {transactionTypeLabels[transaction.type]}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-right text-slate-600">
                    {formatNumber(transaction.qty)}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-right text-slate-900">
                    {formatRupiah(transaction.fee)}
                  </TableCell>
                  <TableCell className="px-5 py-4">
                    <Badge
                      variant="outline"
                      className={getOrderStatusBadge(transaction.status)}
                    >
                      {orderStatusLabels[transaction.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  )
}

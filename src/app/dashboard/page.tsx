"use client"

import {
  Activity,
  ArrowRight,
  BadgeAlert,
  Boxes,
  Building2,
  ClipboardList,
  Gauge,
  PieChart as PieChartIcon,
  RefreshCw,
  TrendingUp,
  Users,
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
import palletsData from "@/data/mock/pallets.json"
import skusData from "@/data/mock/skus.json"
import transactionsData from "@/data/mock/transactions.json"
import warehouseData from "@/data/mock/warehouse.json"
import {
  getOrderStatusBadgeClass,
  getStockBadgeClass,
  orderStatusLabels,
  stockStatusLabels,
  transactionTypeLabels,
} from "@/lib/badge-styles"
import { formatDate, formatNumber, formatRupiah, formatShortRupiah } from "@/lib/utils"
import { diffDays, DEAD_STOCK_PENALTY_DAYS, getDeadStockAlerts } from "@/lib/billing-engine"
import type { BillingItem, Client, Pallet, SKU, Transaction, WarehouseConfig } from "@/types"
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
const pallets: Pallet[] = palletsData as Pallet[]
const warehouseConfig = warehouseData as WarehouseConfig

const operationalFlow = [
  { label: "Barang Masuk", value: 520 },
  { label: "Picking", value: 210 },
  { label: "Packing", value: 175 },
  { label: "Siap Kirim", value: 140 },
]

const revenueChartData = (() => {
  const mayBilling = billingItems.filter((b) => b.billingMonth === "2025-05")
  const storageFeeTotal = mayBilling.reduce((sum, b) => sum + b.storageFee, 0)
  const fulfillmentFeeTotal = mayBilling.reduce(
    (sum, b) => sum + b.inboundFee + b.outboundFee + b.pickingPackingFee + b.returnFee + b.expiredFee + b.withdrawalFee + b.deadStockFee,
    0
  )
  return [
    { name: "Sewa Space", value: storageFeeTotal },
    { name: "Jasa Fulfillment", value: fulfillmentFeeTotal },
  ]
})()

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

  // Dead stock pallet alerts
  const rateMap = new Map(clients.map((c) => [c.id, c.ratePerM2]))
  const deadStockAlerts = getDeadStockAlerts(pallets, "2025-05-10", rateMap).slice(0, 5)

  const stats = [
    {
      label: "Total Klien Aktif",
      value: formatNumber(activeClients.length),
      description: "Klien aktif dengan kontrak berjalan",
      icon: Building2,
      iconClassName: "from-blue-50 to-blue-100 text-blue-700",
      accentColor: "border-l-blue-500",
    },
    {
      label: "SKU Kritis",
      value: formatNumber(criticalSkus.length),
      description: "Produk yang butuh restock segera",
      icon: BadgeAlert,
      iconClassName: "from-red-50 to-red-100 text-red-600",
      accentColor: "border-l-red-500",
    },
    {
      label: "Transaksi Bulan Ini",
      value: formatNumber(monthlyTransactions.length),
      description: "Aktivitas inbound, outbound, retur, dan withdrawal",
      icon: ClipboardList,
      iconClassName: "from-amber-50 to-amber-100 text-amber-700",
      accentColor: "border-l-amber-500",
    },
    {
      label: "Total Revenue Bulan Ini",
      value: formatRupiah(monthlyRevenue),
      description: "Akumulasi billing bulan Mei 2025",
      icon: Wallet,
      iconClassName: "from-emerald-50 to-emerald-100 text-emerald-700",
      accentColor: "border-l-emerald-500",
    },
  ]

  return (
    <section className="space-y-6">
      <div className="space-y-2 animate-fade-in-up">
        <p className="text-sm font-medium text-blue-600">
          <span className="section-dot" />
          Overview Operasional
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Ringkasan hybrid warehouse fulfillment
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Pantau klien aktif, volume transaksi, alur operasional, dan sinyal stok
          dalam satu tampilan yang ringkas.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-4">
        {stats.map((item, index) => {
          const Icon = item.icon

          return (
            <Card
              key={item.label}
              className={`card-glass card-hover animate-fade-in-up border-l-4 ${item.accentColor} stagger-${index + 1}`}
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
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.iconClassName}`}
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

      {/* ── KPI Panel ──────────────────────────────────────────────── */}
      <Card className="card-glass animate-fade-in-up">
        <CardHeader className="border-b border-slate-100/80">
          <CardTitle>
            <span className="section-dot" />
            Key Performance Indicators
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {(() => {
              // KPI-01: Profit per m² per bulan
              const opexRatio = 0.20
              const estimatedProfit = monthlyRevenue * (1 - opexRatio)
              const profitPerM2 = warehouseConfig.effectiveAreaM2 > 0
                ? estimatedProfit / warehouseConfig.effectiveAreaM2
                : 0

              // KPI-02: Warehouse utilization rate
              const totalPalletSlots = pallets.length > 0 ? pallets.length : 1
              const occupiedPallets = pallets.filter(
                (p) => diffDays(p.lastMoveDate, "2025-05-10") <= DEAD_STOCK_PENALTY_DAYS
              ).length
              const utilizationRate = (occupiedPallets / totalPalletSlots) * 100

              // KPI-03: Turnover rate
              const totalOutboundQty = transactions
                .filter((t) => t.type === "outbound")
                .reduce((sum, t) => sum + t.qty, 0)
              const avgStock = skus.length > 0
                ? skus.reduce((sum, s) => sum + s.stockQty, 0) / skus.length
                : 1
              const turnoverRate = avgStock > 0 ? totalOutboundQty / avgStock : 0

              // KPI-04: Dead stock ratio
              const deadStockPallets = pallets.filter(
                (p) => diffDays(p.lastMoveDate, "2025-05-10") > DEAD_STOCK_PENALTY_DAYS
              ).length
              const deadStockRatio = (deadStockPallets / totalPalletSlots) * 100

              // KPI-05: Client retention rate
              const activeClientCount = clients.filter((c) => c.status === "active").length
              const retentionRate = clients.length > 0
                ? (activeClientCount / clients.length) * 100
                : 0

              // KPI-06: Revenue mix ratio
              const mayBilling = billingItems.filter((b) => b.billingMonth === "2025-05")
              const storageTotal = mayBilling.reduce((s, b) => s + b.storageFee, 0)
              const fulfillmentTotal = mayBilling.reduce(
                (s, b) => s + b.inboundFee + b.outboundFee + b.pickingPackingFee + b.returnFee + b.expiredFee + b.withdrawalFee + b.deadStockFee,
                0
              )
              const revenueTotal = storageTotal + fulfillmentTotal
              const spacePct = revenueTotal > 0 ? Math.round((storageTotal / revenueTotal) * 100) : 0
              const ffPct = 100 - spacePct

              const kpis = [
                {
                  label: "Profit per m²",
                  value: `${formatRupiah(Math.round(profitPerM2))}/m²`,
                  description: "Estimasi profit per m² efektif per bulan",
                  icon: TrendingUp,
                  iconClass: "from-blue-50 to-blue-100 text-blue-700",
                },
                {
                  label: "Utilisasi Gudang",
                  value: `${utilizationRate.toFixed(1)}%`,
                  description: "Target: >85% kapasitas pallet terpakai",
                  icon: Gauge,
                  iconClass: "from-emerald-50 to-emerald-100 text-emerald-700",
                  target: utilizationRate >= 85,
                  targetLabel: utilizationRate >= 85 ? "✓ On Target" : "⚠ Below Target",
                },
                {
                  label: "Turnover Rate",
                  value: `${turnoverRate.toFixed(2)}×`,
                  description: "Rasio outbound terhadap rata-rata stok",
                  icon: RefreshCw,
                  iconClass: "from-violet-50 to-violet-100 text-violet-700",
                },
                {
                  label: "Dead Stock Ratio",
                  value: `${deadStockRatio.toFixed(1)}%`,
                  description: "Target: <10% pallet tidak bergerak >90 hari",
                  icon: Activity,
                  iconClass: "from-amber-50 to-amber-100 text-amber-700",
                  target: deadStockRatio < 10,
                  targetLabel: deadStockRatio < 10 ? "✓ On Target" : "⚠ Below Target",
                },
                {
                  label: "Retensi Klien",
                  value: `${Math.round(retentionRate)}%`,
                  description: "Target: >80% klien tetap aktif",
                  icon: Users,
                  iconClass: "from-sky-50 to-sky-100 text-sky-700",
                  target: retentionRate >= 80,
                  targetLabel: retentionRate >= 80 ? "✓ On Target" : "⚠ Below Target",
                },
                {
                  label: "Revenue Mix",
                  value: `${spacePct}% : ${ffPct}%`,
                  description: "Sewa Space vs Fulfillment",
                  icon: PieChartIcon,
                  iconClass: "from-orange-50 to-orange-100 text-orange-700",
                },
              ]

              return kpis.map((kpi) => {
                const Icon = kpi.icon
                return (
                  <div
                    key={kpi.label}
                    className="group rounded-xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/80 p-4 transition-all duration-200 hover:border-blue-200/60 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${kpi.iconClass}`}>
                        <Icon className="size-4" />
                      </div>
                      {"target" in kpi ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            kpi.target
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {kpi.targetLabel}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                      {kpi.label}
                    </p>
                    <p className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
                      {kpi.value}
                    </p>
                    <p className="mt-1.5 text-xs leading-5 text-slate-500">
                      {kpi.description}
                    </p>
                  </div>
                )
              })
            })()}
          </div>
        </CardContent>
      </Card>

      <Card className="card-glass animate-fade-in-up">
        <CardHeader className="border-b border-slate-100/80">
          <CardTitle>
            <span className="section-dot" />
            Alur Operasional Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
            {operationalFlow.map((step, index) => (
              <div
                key={step.label}
                className="contents"
              >
                <div className="group rounded-xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white px-4 py-4 transition-all duration-200 hover:border-blue-200/60 hover:shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-blue-700 text-[10px] font-bold text-white">
                      {index + 1}
                    </span>
                    <Boxes className="size-4 text-slate-400 transition-colors duration-200 group-hover:text-blue-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">{step.label}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                    {formatNumber(step.value)}
                  </p>
                </div>
                {index < operationalFlow.length - 1 ? (
                  <div className="hidden items-center justify-center md:flex">
                    <ArrowRight className="size-4 text-blue-300" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-5">
        <Card className="card-glass animate-fade-in-up xl:col-span-3">
          <CardHeader className="border-b border-slate-100/80">
            <CardTitle>
              <span className="section-dot" />
              Perbandingan Revenue
            </CardTitle>
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
                    cursor={{ fill: "#eff6ff" }}
                    formatter={(value) => formatRupiah(Number(value))}
                    contentStyle={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                      backgroundColor: "rgba(255,255,255,0.95)",
                      backdropFilter: "blur(8px)",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#2563eb"
                    radius={[10, 10, 0, 0]}
                    maxBarSize={72}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass animate-fade-in-up xl:col-span-2">
          <CardHeader className="border-b border-slate-100/80">
            <CardTitle>
              <span className="section-dot" />
              Peringatan Stok
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-5">
            {stockAlerts.map((sku) => (
              <div
                key={sku.id}
                className={`flex items-start justify-between gap-4 rounded-xl border px-4 py-3 transition-all duration-200 hover:shadow-sm ${
                  sku.status === "kritis"
                    ? "border-red-200/60 bg-gradient-to-r from-red-50/80 to-white"
                    : "border-amber-200/60 bg-gradient-to-r from-amber-50/80 to-white"
                }`}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    {sku.status === "kritis" ? (
                      <span className="size-1.5 rounded-full bg-red-500 animate-pulse-dot" />
                    ) : null}
                    <p className="line-clamp-2 text-sm font-medium leading-5 text-slate-900">
                      {sku.name}
                    </p>
                  </div>
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

      <Card className="card-glass animate-fade-in-up">
        <CardHeader className="border-b border-slate-100/80">
          <CardTitle>
            <span className="section-dot" />
            Transaksi Terbaru
          </CardTitle>
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
                  className="border-slate-100/80 transition-colors duration-150 hover:bg-blue-50/30"
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
                      className={getOrderStatusBadgeClass(transaction.status)}
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

      {deadStockAlerts.length > 0 ? (
        <Card className="card-glass animate-fade-in-up border-l-4 border-l-orange-500 border-orange-200/60 bg-gradient-to-r from-orange-50/60 via-white to-white">
          <CardHeader className="border-b border-orange-100/80">
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <BadgeAlert className="size-4" />
              Peringatan Dead Stock Pallet
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {deadStockAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center gap-3 rounded-xl border border-orange-100/80 bg-gradient-to-r from-orange-50/60 to-white px-4 py-3 transition-all duration-200 hover:shadow-sm"
                >
                  <span className={`size-2 shrink-0 rounded-full ${alert.isDeadStock ? "bg-red-500 animate-pulse-dot" : "bg-amber-500"}`} />
                  <div>
                    <p className="font-medium text-slate-900">
                      {alert.position} · {clientMap.get(alert.clientId) ?? "-"}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-600">
                      {alert.daysStored} hari ·{" "}
                      {alert.isDeadStock ? (
                        <span className="font-medium text-red-600">2× tarif</span>
                      ) : (
                        <span className="font-medium text-amber-600">warning</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </section>
  )
}

import Link from "next/link"
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  ReceiptText,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react"

import billingData from "@/data/mock/billing.json"
import clientsData from "@/data/mock/clients.json"
import palletsData from "@/data/mock/pallets.json"
import skusData from "@/data/mock/skus.json"
import transactionsData from "@/data/mock/transactions.json"
import {
  billingStatusLabels,
  clientStatusLabels,
  clientTypeLabels,
  contractTypeLabels,
  getBillingStatusBadgeClass,
  getClientStatusBadgeClass,
  getClientTypeBadgeClass,
  getContractBadgeClass,
  getOrderStatusBadgeClass,
  getStockBadgeClass,
  getTransactionTypeBadgeClass,
  orderStatusLabels,
  stockStatusLabels,
  transactionTypeLabels,
} from "@/lib/badge-styles"
import { formatDate, formatNumber, formatRupiah } from "@/lib/utils"
import { getDeadStockAlerts } from "@/lib/billing-engine"
import type {
  BillingItem,
  Client,
  Pallet,
  SKU,
  Transaction,
} from "@/types"
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

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User
  label: string
  value: string
}) {
  return (
    <div className="group rounded-xl border border-slate-200/60 bg-gradient-to-br from-slate-50/80 to-white px-4 py-3 transition-all duration-200 hover:border-blue-200/60 hover:shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
        <Icon className="size-4 transition-colors duration-200 group-hover:text-blue-600" />
        {label}
      </div>
      <p className="text-sm leading-6 text-slate-900">{value}</p>
    </div>
  )
}

function MiniStatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <Card className={`card-glass card-hover border-l-4 ${accent ?? "border-l-blue-500"}`}>
      <CardContent className="p-4">
        <p className="text-sm font-medium leading-5 text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const client = clients.find((item) => item.id === id)

  if (!client) {
    return (
      <section className="space-y-6">
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-slate-900"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Daftar Klien
        </Link>

        <Card className="card-glass">
          <CardContent className="px-6 py-10 text-center">
            <p className="text-lg font-semibold text-slate-900">Klien tidak ditemukan</p>
            <p className="mt-2 text-sm text-slate-500">
              ID klien yang diminta tidak tersedia pada data mock saat ini.
            </p>
          </CardContent>
        </Card>
      </section>
    )
  }

  const clientSkus = skus.filter((sku) => sku.clientId === client.id)
  const clientTransactions = transactions
    .filter((transaction) => transaction.clientId === client.id)
    .sort((left, right) => right.date.localeCompare(left.date))
  const currentBilling =
    billingItems.find(
      (item) => item.clientId === client.id && item.billingMonth === "2025-05"
    ) ?? null
  const skuNameMap = new Map(clientSkus.map((sku) => [sku.id, sku.name]))

  const monthlyTransactionCount = clientTransactions.filter((transaction) =>
    transaction.date.startsWith("2025-05")
  ).length
  const totalVolume = clientTransactions.reduce((sum, transaction) => sum + transaction.qty, 0)
  const criticalSkuCount = clientSkus.filter((sku) => sku.status === "kritis").length
  const lowSkuCount = clientSkus.filter((sku) => sku.status === "menipis").length
  const storageEstimate = client.areaM2 * client.rackLevels * client.ratePerM2

  // Dead stock alerts for this client
  const clientPallets = pallets.filter((p) => p.clientId === client.id)
  const rateMap = new Map([[client.id, client.ratePerM2]])
  const deadStockAlerts = getDeadStockAlerts(clientPallets, "2025-05-10", rateMap)
  const skuNameById = new Map(clientSkus.map((s) => [s.id, s.name]))

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-6 xl:col-span-3">
          <Card className="card-glass overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400" />
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 border-b border-slate-100/80 pb-5 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                      {client.name}
                    </h2>
                    <Badge
                      variant="outline"
                      className={getClientTypeBadgeClass(client.type)}
                    >
                      {clientTypeLabels[client.type]}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={getContractBadgeClass(client.contractType)}
                    >
                      {contractTypeLabels[client.contractType]}
                    </Badge>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    Profil klien untuk operasional sewa space dan fulfillment.
                  </p>
                </div>

                <Badge
                  variant="outline"
                  className={getClientStatusBadgeClass(client.status)}
                >
                  {clientStatusLabels[client.status]}
                </Badge>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <InfoItem icon={User} label="Contact Person" value={client.contactPerson} />
                <InfoItem icon={Phone} label="Phone" value={client.phone} />
                <InfoItem icon={MapPin} label="Address" value={client.address} />
                <InfoItem icon={Calendar} label="Join Date" value={formatDate(client.joinDate)} />
                <InfoItem
                  icon={ReceiptText}
                  label="Area"
                  value={`${formatNumber(client.areaM2)} m² · ${formatNumber(client.rackLevels)} level rack`}
                />
                <InfoItem
                  icon={ReceiptText}
                  label="Rate"
                  value={`${formatRupiah(client.ratePerM2)}/m²`}
                />
                <InfoItem
                  icon={ShieldCheck}
                  label="Kontrak"
                  value={`${formatDate(client.contractStart)} — ${formatDate(client.contractEnd)}`}
                />
                <InfoItem
                  icon={Wallet}
                  label="Minimum Billing"
                  value={client.minimumBilling > 0 ? formatRupiah(client.minimumBilling) : "Tidak ada"}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardHeader className="border-b border-slate-100/80">
              <div className="flex items-center justify-between gap-3">
                <CardTitle>
                  <span className="section-dot" />
                  Produk SKU
                </CardTitle>
                <Badge variant="outline" className="border-slate-200/60 bg-slate-100 text-slate-700">
                  {formatNumber(clientSkus.length)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {clientSkus.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-slate-500">
                  Belum ada SKU terdaftar
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-5 py-3 text-slate-500">SKU Code</TableHead>
                      <TableHead className="px-5 py-3 text-slate-500">Nama</TableHead>
                      <TableHead className="px-5 py-3 text-slate-500">Kategori</TableHead>
                      <TableHead className="px-5 py-3 text-slate-500">Stok</TableHead>
                      <TableHead className="px-5 py-3 text-slate-500">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientSkus.map((sku) => (
                      <TableRow key={sku.id} className="border-slate-100/80 transition-colors duration-150 hover:bg-blue-50/30">
                        <TableCell className="px-5 py-4 font-medium text-slate-900">
                          {sku.skuCode}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-slate-600">{sku.name}</TableCell>
                        <TableCell className="px-5 py-4 capitalize text-slate-600">
                          {sku.category.replaceAll("_", " ")}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-slate-600">
                          {formatNumber(sku.stockQty)} {sku.unit}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <Badge
                            variant="outline"
                            className={getStockBadgeClass(sku.status)}
                          >
                            {stockStatusLabels[sku.status]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardHeader className="border-b border-slate-100/80">
              <div className="flex items-center justify-between gap-3">
                <CardTitle>
                  <span className="section-dot" />
                  Riwayat Transaksi
                </CardTitle>
                <Badge variant="outline" className="border-slate-200/60 bg-slate-100 text-slate-700">
                  {formatNumber(clientTransactions.length)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {clientTransactions.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-slate-500">
                  Belum ada transaksi untuk klien ini
                </div>
              ) : (
                <Table className="min-w-[760px]">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-5 py-3 text-slate-500">Tanggal</TableHead>
                      <TableHead className="px-5 py-3 text-slate-500">Tipe</TableHead>
                      <TableHead className="px-5 py-3 text-slate-500">SKU</TableHead>
                      <TableHead className="px-5 py-3 text-right text-slate-500">Qty</TableHead>
                      <TableHead className="px-5 py-3 text-right text-slate-500">Fee</TableHead>
                      <TableHead className="px-5 py-3 text-slate-500">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientTransactions.map((transaction) => (
                      <TableRow
                        key={transaction.id}
                        className="border-slate-100/80 transition-colors duration-150 hover:bg-blue-50/30"
                      >
                        <TableCell className="px-5 py-4 text-slate-600">
                          {formatDate(transaction.date)}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <Badge
                            variant="outline"
                            className={getTransactionTypeBadgeClass(transaction.type)}
                          >
                            {transactionTypeLabels[transaction.type]}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-slate-600">
                          {skuNameMap.get(transaction.skuId) ?? "-"}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-right text-slate-600">
                          {formatNumber(transaction.qty)}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-right font-medium text-slate-900">
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
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 xl:col-span-2">
          <Link
            href="/clients"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-slate-900"
          >
            <ArrowLeft className="size-4" />
            Kembali ke Daftar Klien
          </Link>

          <Card className="card-glass">
            <CardHeader className="border-b border-slate-100/80">
              <div className="flex items-center justify-between gap-3">
                <CardTitle>
                  <span className="section-dot" />
                  Tagihan Bulan Ini
                </CardTitle>
                {currentBilling ? (
                  <Badge
                    variant="outline"
                    className={getBillingStatusBadgeClass(currentBilling.status)}
                  >
                    {billingStatusLabels[currentBilling.status]}
                  </Badge>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {currentBilling ? (
                <>
                  <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-center justify-between gap-4 rounded-lg px-2 py-1 transition-colors duration-150 hover:bg-slate-50">
                      <span>Storage Fee</span>
                      <span>{formatRupiah(currentBilling.storageFee)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-lg px-2 py-1 transition-colors duration-150 hover:bg-slate-50">
                      <span>Inbound Fee</span>
                      <span>{formatRupiah(currentBilling.inboundFee)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-lg px-2 py-1 transition-colors duration-150 hover:bg-slate-50">
                      <span>Outbound Fee</span>
                      <span>{formatRupiah(currentBilling.outboundFee)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-lg px-2 py-1 transition-colors duration-150 hover:bg-slate-50">
                      <span>Picking & Packing Fee</span>
                      <span>{formatRupiah(currentBilling.pickingPackingFee)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-lg px-2 py-1 transition-colors duration-150 hover:bg-slate-50">
                      <span>Return Fee</span>
                      <span>{formatRupiah(currentBilling.returnFee)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-lg px-2 py-1 transition-colors duration-150 hover:bg-slate-50">
                      <span>Expired Fee</span>
                      <span>{formatRupiah(currentBilling.expiredFee)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-lg px-2 py-1 transition-colors duration-150 hover:bg-slate-50">
                      <span>Withdrawal Fee</span>
                      <span>{formatRupiah(currentBilling.withdrawalFee)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-lg px-2 py-1 transition-colors duration-150 hover:bg-slate-50">
                      <span>Dead Stock Fee</span>
                      <span>{formatRupiah(currentBilling.deadStockFee)}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200/60 pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-slate-500">TOTAL</span>
                      <span className="bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-2xl font-semibold tracking-tight text-transparent">
                        {formatRupiah(currentBilling.totalFee)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm leading-6 text-slate-600">
                    Belum ada tagihan tersimpan untuk Mei 2025. Nilai berikut adalah
                    estimasi storage fee berdasarkan area, level rack, dan rate aktif.
                  </p>
                  <div className="rounded-xl border border-slate-200/60 bg-gradient-to-br from-slate-50/80 to-white px-4 py-4">
                    <p className="text-sm font-medium text-slate-500">Estimasi storage fee</p>
                    <p className="mt-2 bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-2xl font-semibold tracking-tight text-transparent">
                      {formatRupiah(storageEstimate)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <MiniStatCard
              label="Total Transaksi Bulan Ini"
              value={formatNumber(monthlyTransactionCount)}
              accent="border-l-blue-500"
            />
            <MiniStatCard label="Total Volume" value={formatNumber(totalVolume)} accent="border-l-emerald-500" />
            <MiniStatCard label="SKU Kritis" value={formatNumber(criticalSkuCount)} accent="border-l-red-500" />
            <MiniStatCard label="SKU Menipis" value={formatNumber(lowSkuCount)} accent="border-l-amber-500" />
          </div>

          {deadStockAlerts.length > 0 ? (
            <Card className="border-l-4 border-l-orange-500 border-orange-200/60 bg-gradient-to-r from-orange-50/60 via-white to-white shadow-sm ring-0">
              <CardHeader className="border-b border-orange-100/80">
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <AlertTriangle className="size-4" />
                  Peringatan Dead Stock
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-5">
                {deadStockAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-center gap-3 rounded-xl border border-orange-100/80 bg-gradient-to-r from-orange-50/60 to-white px-4 py-3 transition-all duration-200 hover:shadow-sm"
                  >
                    <span className={`size-2 shrink-0 rounded-full ${alert.isDeadStock ? "bg-red-500 animate-pulse-dot" : "bg-amber-500"}`} />
                    <div>
                      <p className="font-medium text-slate-900">
                        Pallet {alert.position} — {skuNameById.get(alert.skuId) ?? alert.skuId}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {alert.daysStored} hari tidak bergerak ·{" "}
                        {alert.isDeadStock ? (
                          <span className="font-medium text-red-600">Penalti 2× tarif aktif</span>
                        ) : (
                          <span className="font-medium text-amber-600">Peringatan — segera pindahkan</span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </section>
  )
}

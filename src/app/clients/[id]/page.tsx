import Link from "next/link"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  ReceiptText,
  User,
} from "lucide-react"

import billingData from "@/data/mock/billing.json"
import clientsData from "@/data/mock/clients.json"
import skusData from "@/data/mock/skus.json"
import transactionsData from "@/data/mock/transactions.json"
import { formatNumber, formatRupiah } from "@/lib/utils"
import type {
  BillingItem,
  Client,
  ClientStatus,
  ClientType,
  ContractType,
  OrderStatus,
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

const typeLabels: Record<ClientType, string> = {
  space: "Space",
  fulfillment: "Fulfillment",
  hybrid: "Hybrid",
}

const contractLabels: Record<ContractType, string> = {
  reguler: "Reguler",
  group: "Group",
}

const clientStatusLabels: Record<ClientStatus, string> = {
  active: "Aktif",
  inactive: "Tidak Aktif",
}

const stockStatusLabels: Record<SKU["status"], string> = {
  aman: "Aman",
  menipis: "Menipis",
  kritis: "Kritis",
}

const transactionTypeLabels: Record<Transaction["type"], string> = {
  inbound: "Inbound",
  outbound: "Outbound",
  return: "Retur",
  expired: "Expired",
  withdrawal: "Withdrawal",
}

const orderStatusLabels: Record<OrderStatus, string> = {
  pending: "Menunggu",
  picking: "Picking",
  packing: "Packing",
  shipped: "Terkirim",
  cancelled: "Dibatalkan",
}

const billingStatusLabels: Record<BillingItem["status"], string> = {
  draft: "Draft",
  sent: "Terkirim",
  paid: "Lunas",
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
}

function getTypeBadgeClass(type: ClientType): string {
  if (type === "space") {
    return "border-blue-200 bg-white text-blue-700 hover:bg-blue-50"
  }

  if (type === "fulfillment") {
    return "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-50"
  }

  return "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-50"
}

function getContractBadgeClass(contractType: ContractType): string {
  if (contractType === "group") {
    return "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50"
  }

  return "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100"
}

function getClientStatusBadgeClass(status: ClientStatus): string {
  if (status === "active") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
  }

  return "border-red-200 bg-red-50 text-red-700 hover:bg-red-50"
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

function getTransactionTypeBadgeClass(type: Transaction["type"]): string {
  switch (type) {
    case "inbound":
      return "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50"
    case "outbound":
      return "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-50"
    case "return":
      return "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-50"
    case "expired":
      return "border-red-200 bg-red-50 text-red-700 hover:bg-red-50"
    case "withdrawal":
      return "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100"
    default:
      return ""
  }
}

function getOrderStatusBadgeClass(status: OrderStatus): string {
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

function getBillingStatusBadgeClass(status: BillingItem["status"]): string {
  if (status === "paid") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
  }

  if (status === "sent") {
    return "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50"
  }

  return "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50"
}

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
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
        <Icon className="size-4" />
        {label}
      </div>
      <p className="text-sm leading-6 text-slate-900">{value}</p>
    </div>
  )
}

function MiniStatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border border-slate-200 bg-white shadow-none ring-0">
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

        <Card className="border border-slate-200 bg-white shadow-none ring-0">
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

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-6 xl:col-span-3">
          <Card className="border border-slate-200 bg-white shadow-none ring-0">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                      {client.name}
                    </h2>
                    <Badge
                      variant="outline"
                      className={getTypeBadgeClass(client.type)}
                    >
                      {typeLabels[client.type]}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={getContractBadgeClass(client.contractType)}
                    >
                      {contractLabels[client.contractType]}
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
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-none ring-0">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Produk SKU</CardTitle>
                <Badge variant="outline" className="border-slate-200 bg-slate-100 text-slate-700">
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
                      <TableRow key={sku.id} className="border-slate-100 hover:bg-slate-50">
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

          <Card className="border border-slate-200 bg-white shadow-none ring-0">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Riwayat Transaksi</CardTitle>
                <Badge variant="outline" className="border-slate-200 bg-slate-100 text-slate-700">
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
                        className="border-slate-100 hover:bg-slate-50"
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

          <Card className="border border-slate-200 bg-white shadow-none ring-0">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Tagihan Bulan Ini</CardTitle>
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
                    <div className="flex items-center justify-between gap-4">
                      <span>Storage Fee</span>
                      <span>{formatRupiah(currentBilling.storageFee)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Inbound Fee</span>
                      <span>{formatRupiah(currentBilling.inboundFee)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Outbound Fee</span>
                      <span>{formatRupiah(currentBilling.outboundFee)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Picking & Packing Fee</span>
                      <span>{formatRupiah(currentBilling.pickingPackingFee)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Return Fee</span>
                      <span>{formatRupiah(currentBilling.returnFee)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Expired Fee</span>
                      <span>{formatRupiah(currentBilling.expiredFee)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Withdrawal Fee</span>
                      <span>{formatRupiah(currentBilling.withdrawalFee)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Dead Stock Fee</span>
                      <span>{formatRupiah(currentBilling.deadStockFee)}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium text-slate-500">TOTAL</span>
                      <span className="text-2xl font-semibold tracking-tight text-indigo-700">
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
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-sm font-medium text-slate-500">Estimasi storage fee</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-indigo-700">
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
            />
            <MiniStatCard label="Total Volume" value={formatNumber(totalVolume)} />
            <MiniStatCard label="SKU Kritis" value={formatNumber(criticalSkuCount)} />
            <MiniStatCard label="SKU Menipis" value={formatNumber(lowSkuCount)} />
          </div>
        </div>
      </div>
    </section>
  )
}
